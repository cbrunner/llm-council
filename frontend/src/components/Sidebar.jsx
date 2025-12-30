import { useState } from 'react';
import './Sidebar.css';

export default function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onArchiveConversation,
  onDeleteConversation,
  showArchived,
  onToggleShowArchived,
  isOpen,
  onClose,
}) {
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleMenuClick = (e, convId) => {
    e.stopPropagation();
    setMenuOpenId(menuOpenId === convId ? null : convId);
  };

  const handleArchive = (e, convId, isArchived) => {
    e.stopPropagation();
    onArchiveConversation(convId, !isArchived);
    setMenuOpenId(null);
  };

  const handleDeleteClick = (e, convId) => {
    e.stopPropagation();
    setConfirmDeleteId(convId);
    setMenuOpenId(null);
  };

  const handleConfirmDelete = async (e) => {
    e.stopPropagation();
    try {
      await onDeleteConversation(confirmDeleteId);
    } catch (error) {
      console.error('Delete failed:', error);
    }
    setConfirmDeleteId(null);
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
  };

  const activeConversations = conversations.filter(c => !c.archived);
  const archivedConversations = conversations.filter(c => c.archived);

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-header-top">
          <h1>LLM Council</h1>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
            &times;
          </button>
        </div>
        <button className="new-conversation-btn" onClick={onNewConversation}>
          + New Conversation
        </button>
      </div>

      <div className="conversation-list">
        {activeConversations.length === 0 && !showArchived ? (
          <div className="no-conversations">No conversations yet</div>
        ) : (
          activeConversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${
                conv.id === currentConversationId ? 'active' : ''
              }`}
              onClick={() => onSelectConversation(conv.id)}
            >
              <div className="conversation-content">
                <div className="conversation-title">
                  {conv.title || 'New Conversation'}
                </div>
                <div className="conversation-meta">
                  {conv.message_count} messages
                </div>
              </div>
              <button
                className="conversation-menu-btn"
                onClick={(e) => handleMenuClick(e, conv.id)}
              >
                ...
              </button>
              {menuOpenId === conv.id && (
                <div className="conversation-menu">
                  <button onClick={(e) => handleArchive(e, conv.id, conv.archived)}>
                    Archive
                  </button>
                  <button className="delete-btn" onClick={(e) => handleDeleteClick(e, conv.id)}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}

        {archivedConversations.length > 0 && (
          <>
            <button 
              className="show-archived-btn"
              onClick={onToggleShowArchived}
            >
              {showArchived ? 'Hide' : 'Show'} Archived ({archivedConversations.length})
            </button>
            
            {showArchived && archivedConversations.map((conv) => (
              <div
                key={conv.id}
                className={`conversation-item archived ${
                  conv.id === currentConversationId ? 'active' : ''
                }`}
                onClick={() => onSelectConversation(conv.id)}
              >
                <div className="conversation-content">
                  <div className="conversation-title">
                    {conv.title || 'New Conversation'}
                  </div>
                  <div className="conversation-meta">
                    {conv.message_count} messages (archived)
                  </div>
                </div>
                <button
                  className="conversation-menu-btn"
                  onClick={(e) => handleMenuClick(e, conv.id)}
                >
                  ...
                </button>
                {menuOpenId === conv.id && (
                  <div className="conversation-menu">
                    <button onClick={(e) => handleArchive(e, conv.id, conv.archived)}>
                      Unarchive
                    </button>
                    <button className="delete-btn" onClick={(e) => handleDeleteClick(e, conv.id)}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {confirmDeleteId && (
        <div className="delete-modal-overlay" onClick={handleCancelDelete}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <p>Are you sure you want to permanently delete this conversation?</p>
            <div className="delete-modal-actions">
              <button onClick={handleCancelDelete}>Cancel</button>
              <button className="confirm-delete-btn" onClick={handleConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
