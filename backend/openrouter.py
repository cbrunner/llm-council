"""OpenRouter API client for making LLM requests."""

import httpx
from typing import List, Dict, Any, Optional
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception,
    RetryError
)
from .config import OPENROUTER_API_KEY, OPENROUTER_API_URL


class OpenRouterAPIError(Exception):
    """Custom exception for OpenRouter API errors with retry info."""
    def __init__(self, message: str, model: str, status_code: Optional[int] = None, retryable: bool = False):
        super().__init__(message)
        self.model = model
        self.status_code = status_code
        self.retryable = retryable


def should_retry_exception(exception: BaseException) -> bool:
    """
    Determine if an exception should trigger a retry.
    
    Retries on:
    - Timeout errors
    - HTTP 5xx server errors
    - HTTP 429 rate limit errors
    
    Does NOT retry on:
    - HTTP 4xx client errors (except 429)
    - Other exceptions
    """
    if isinstance(exception, httpx.TimeoutException):
        return True
    if isinstance(exception, httpx.HTTPStatusError):
        status = exception.response.status_code
        return status >= 500 or status == 429
    if isinstance(exception, OpenRouterAPIError):
        return exception.retryable
    return False


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception(should_retry_exception),
    reraise=True
)
async def _query_model_with_retry(
    model: str,
    messages: List[Dict[str, str]],
    timeout: float = 120.0,
    web_search: bool = False
) -> Dict[str, Any]:
    """
    Internal function that makes the actual API call with retry logic.
    
    Raises exceptions for retry handling - use query_model for safe calls.
    """
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": model,
        "messages": messages,
    }

    if web_search:
        payload["plugins"] = [{"id": "web"}]

    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(
            OPENROUTER_API_URL,
            headers=headers,
            json=payload
        )
        response.raise_for_status()

        data = response.json()
        message = data['choices'][0]['message']

        return {
            'content': message.get('content'),
            'reasoning_details': message.get('reasoning_details'),
            'annotations': message.get('annotations')
        }


async def query_model(
    model: str,
    messages: List[Dict[str, str]],
    timeout: float = 120.0,
    web_search: bool = False
) -> Optional[Dict[str, Any]]:
    """
    Query a single model via OpenRouter API with retry logic.

    Args:
        model: OpenRouter model identifier (e.g., "openai/gpt-4o")
        messages: List of message dicts with 'role' and 'content'
        timeout: Request timeout in seconds
        web_search: Whether to enable web search plugin

    Returns:
        Response dict with 'content' and optional 'reasoning_details', or None if failed
    """
    try:
        return await _query_model_with_retry(model, messages, timeout, web_search)
    except RetryError as e:
        original = e.last_attempt.exception()
        if original:
            error_msg = _format_error_message(model, original)
        else:
            error_msg = f"[{model}] Failed after 3 retries"
        print(error_msg)
        return None
    except httpx.HTTPStatusError as e:
        error_msg = _format_error_message(model, e)
        print(error_msg)
        return None
    except Exception as e:
        print(f"Error querying model {model}: {e}")
        return None


def _format_error_message(model: str, exception: Exception) -> str:
    """Format a helpful error message based on the exception type."""
    if isinstance(exception, httpx.TimeoutException):
        return f"[{model}] Request timed out after 3 retries. The model may be overloaded."
    if isinstance(exception, httpx.HTTPStatusError):
        status = exception.response.status_code
        if status == 429:
            return f"[{model}] Rate limited (429) after 3 retries. Try again later."
        if status >= 500:
            return f"[{model}] Server error ({status}) after 3 retries. OpenRouter may be experiencing issues."
        if status == 401:
            return f"[{model}] Authentication failed (401). Check your OPENROUTER_API_KEY."
        if status == 403:
            return f"[{model}] Access denied (403). You may not have access to this model."
        if status == 404:
            return f"[{model}] Model not found (404). Check the model identifier."
        return f"[{model}] HTTP error {status}: {exception.response.text[:200]}"
    return f"[{model}] Error: {str(exception)}"


async def query_models_parallel(
    models: List[str],
    messages: List[Dict[str, str]],
    web_search: bool = False
) -> Dict[str, Optional[Dict[str, Any]]]:
    """
    Query multiple models in parallel with graceful failure handling.

    Uses return_exceptions=True so individual model failures don't break
    the entire batch. Failed models return None.

    Args:
        models: List of OpenRouter model identifiers
        messages: List of message dicts to send to each model
        web_search: Whether to enable web search plugin

    Returns:
        Dict mapping model identifier to response dict (or None if failed)
    """
    import asyncio

    tasks = [query_model(model, messages, web_search=web_search) for model in models]
    responses = await asyncio.gather(*tasks, return_exceptions=True)

    results = {}
    for model, response in zip(models, responses):
        if isinstance(response, Exception):
            print(f"[{model}] Unexpected error: {response}")
            results[model] = None
        else:
            results[model] = response

    return results
