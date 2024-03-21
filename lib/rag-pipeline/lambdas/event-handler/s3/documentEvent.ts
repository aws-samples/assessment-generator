export enum DocumentEvent {
  /**
   * An event emitted when a document is marked
   * as having been created or updated. This event
   * signals that the document likely needs to be
   * re-processed and re-indexed by middlewares
   * in the chain.
   */
  DOCUMENT_CREATED = "document-created",
  /**
   * An event emitted when a document is marked
   * as having been deleted. This event signals
   * that the document likely needs to be removed from
   * any storage by middlewares in the chain.
   * A good practice for middlewares that don't handle
   * persistence is to simply forward this event to
   * the next middlewares in the chain.
   */
  DOCUMENT_DELETED = "document-deleted"
}