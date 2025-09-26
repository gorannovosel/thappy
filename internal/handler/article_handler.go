package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/goran/thappy/internal/domain/article"
)

type ArticleHandler struct {
	articleService article.Service
}

func NewArticleHandler(articleService article.Service) *ArticleHandler {
	return &ArticleHandler{
		articleService: articleService,
	}
}

func (h *ArticleHandler) CreateArticle(w http.ResponseWriter, r *http.Request) {
	var req CreateArticleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, ErrInvalidJSON.Error())
		return
	}

	if err := req.Validate(); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	articleEntity, err := h.articleService.CreateArticle(
		r.Context(),
		req.ID,
		req.Title,
		req.Content,
		req.Author,
		req.Category,
		req.Slug,
	)
	if err != nil {
		if err == article.ErrArticleAlreadyExists {
			h.writeErrorResponse(w, http.StatusConflict, err.Error())
			return
		}
		if err == article.ErrSlugAlreadyExists {
			h.writeErrorResponse(w, http.StatusConflict, err.Error())
			return
		}
		h.writeErrorResponse(w, http.StatusInternalServerError, "Failed to create article")
		return
	}

	response := CreateArticleResponse{
		Article: ToArticleResponse(articleEntity),
		Message: "Article created successfully",
	}

	h.writeJSONResponse(w, http.StatusCreated, response)
}

func (h *ArticleHandler) HandleArticles(w http.ResponseWriter, r *http.Request) {
	// Parse the URL path to determine the action
	pathParts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")

	// Handle based on method and path structure
	switch r.Method {
	case http.MethodGet:
		if len(pathParts) == 2 { // /api/articles
			h.listArticles(w, r)
		} else if len(pathParts) == 3 && pathParts[2] != "" { // /api/articles/{id_or_slug}
			h.getArticle(w, r, pathParts[2])
		} else {
			h.writeErrorResponse(w, http.StatusBadRequest, "Invalid URL path")
		}
	case http.MethodPost:
		if len(pathParts) == 2 { // /api/articles
			h.CreateArticle(w, r)
		} else {
			h.writeErrorResponse(w, http.StatusBadRequest, "Invalid URL path")
		}
	case http.MethodPut:
		if len(pathParts) == 3 && pathParts[2] != "" { // /api/articles/{id}
			h.updateArticle(w, r, pathParts[2])
		} else {
			h.writeErrorResponse(w, http.StatusBadRequest, "Invalid URL path")
		}
	case http.MethodDelete:
		if len(pathParts) == 3 && pathParts[2] != "" { // /api/articles/{id}
			h.deleteArticle(w, r, pathParts[2])
		} else {
			h.writeErrorResponse(w, http.StatusBadRequest, "Invalid URL path")
		}
	default:
		h.writeErrorResponse(w, http.StatusMethodNotAllowed, "Method not allowed")
	}
}

func (h *ArticleHandler) getArticle(w http.ResponseWriter, r *http.Request, idOrSlug string) {
	var articleEntity *article.Article
	var err error

	// Try to get by slug first (more user-friendly URLs)
	articleEntity, err = h.articleService.GetArticleBySlug(r.Context(), idOrSlug)
	if err != nil && err == article.ErrArticleNotFound {
		// If not found by slug, try by ID
		articleEntity, err = h.articleService.GetArticle(r.Context(), idOrSlug)
	}

	if err != nil {
		if err == article.ErrArticleNotFound {
			h.writeErrorResponse(w, http.StatusNotFound, err.Error())
			return
		}
		h.writeErrorResponse(w, http.StatusInternalServerError, "Failed to get article")
		return
	}

	response := ArticleDetailResponse{
		Article: ToArticleResponse(articleEntity),
	}

	h.writeJSONResponse(w, http.StatusOK, response)
}

func (h *ArticleHandler) listArticles(w http.ResponseWriter, r *http.Request) {
	// Check query parameters for filtering
	publishedOnly := r.URL.Query().Get("published") == "true"
	category := r.URL.Query().Get("category")

	var articles []*article.Article
	var err error

	// Filter by category and published status
	if category != "" {
		if publishedOnly {
			articles, err = h.articleService.ListPublishedArticlesByCategory(r.Context(), category)
		} else {
			articles, err = h.articleService.ListArticlesByCategory(r.Context(), category)
		}
	} else {
		if publishedOnly {
			articles, err = h.articleService.ListPublishedArticles(r.Context())
		} else {
			articles, err = h.articleService.ListArticles(r.Context())
		}
	}

	if err != nil {
		h.writeErrorResponse(w, http.StatusInternalServerError, "Failed to get articles")
		return
	}

	response := ToArticleListResponse(articles)
	h.writeJSONResponse(w, http.StatusOK, response)
}

func (h *ArticleHandler) updateArticle(w http.ResponseWriter, r *http.Request, articleID string) {
	var req UpdateArticleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, ErrInvalidJSON.Error())
		return
	}

	if err := req.Validate(); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	// Get existing article
	articleEntity, err := h.articleService.GetArticle(r.Context(), articleID)
	if err != nil {
		if err == article.ErrArticleNotFound {
			h.writeErrorResponse(w, http.StatusNotFound, err.Error())
			return
		}
		h.writeErrorResponse(w, http.StatusInternalServerError, "Failed to get article")
		return
	}

	// Update fields if provided
	if req.Title != "" {
		if err := articleEntity.UpdateTitle(req.Title); err != nil {
			h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}
	}

	if req.Content != "" {
		if err := articleEntity.UpdateContent(req.Content); err != nil {
			h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}
	}

	if req.Author != "" {
		if err := articleEntity.UpdateAuthor(req.Author); err != nil {
			h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}
	}

	if req.Category != "" {
		if err := articleEntity.UpdateCategory(req.Category); err != nil {
			h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}
	}

	if req.Slug != "" {
		if err := articleEntity.UpdateSlug(req.Slug); err != nil {
			h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}
	}

	if req.IsPublished != nil {
		articleEntity.SetPublished(*req.IsPublished)
	}

	// Save updated article
	if err := h.articleService.UpdateArticle(r.Context(), articleEntity); err != nil {
		if err == article.ErrSlugAlreadyExists {
			h.writeErrorResponse(w, http.StatusConflict, err.Error())
			return
		}
		h.writeErrorResponse(w, http.StatusInternalServerError, "Failed to update article")
		return
	}

	response := ArticleDetailResponse{
		Article: ToArticleResponse(articleEntity),
	}

	h.writeJSONResponse(w, http.StatusOK, response)
}

func (h *ArticleHandler) deleteArticle(w http.ResponseWriter, r *http.Request, articleID string) {
	if err := h.articleService.DeleteArticle(r.Context(), articleID); err != nil {
		if err == article.ErrArticleNotFound {
			h.writeErrorResponse(w, http.StatusNotFound, err.Error())
			return
		}
		h.writeErrorResponse(w, http.StatusInternalServerError, "Failed to delete article")
		return
	}

	h.writeJSONResponse(w, http.StatusOK, map[string]string{
		"message": "Article deleted successfully",
	})
}

// Helper functions
func (h *ArticleHandler) writeJSONResponse(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func (h *ArticleHandler) writeErrorResponse(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	response := map[string]string{"error": message}
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode error response", http.StatusInternalServerError)
	}
}
