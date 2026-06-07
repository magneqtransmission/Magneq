import React from "react";

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
}) => {
  const pages = [];

  // Determine which pages to show
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "ellipsis-end", totalPages);
    } else if (currentPage > totalPages - 4) {
      pages.push(1, "ellipsis-start", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "ellipsis-start", currentPage - 1, currentPage, currentPage + 1, "ellipsis-end", totalPages);
    }
  }

  const handleClick = (page) => {
    if (typeof page === 'number' && page !== currentPage) {
      onPageChange(page);
    }
  };

  const getUniqueKey = (page, index) => {
    if (typeof page === 'number') {
      return `page-${page}`;
    }
    // For ellipsis, use the string identifier which is already unique
    return page;
  };

  return (
    <div className="flex flex-wrap justify-center mt-6 gap-1">
      <nav className="inline-flex items-center space-x-1">
        <button
          className={`px-3 py-1 bg-transparent rounded flex items-center ${
            currentPage === 1 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-[rgba(var(--text))] hover:bg-[rgba(var(--hover))] cursor-pointer'
          }`}
          disabled={currentPage === 1}
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        >
          &larr; Previous
        </button>

        {pages.map((page, idx) =>
          typeof page === 'string' ? (
            <span key={getUniqueKey(page, idx)} className="px-2 py-1 text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={getUniqueKey(page, idx)}
              className={`px-3 py-1 rounded ${
                page === currentPage
                  ? "bg-blue-600 text-white font-semibold"
                  : "text-[rgba(var(--text))] hover:bg-[rgba(var(--hover))]"
              }`}
              onClick={() => handleClick(page)}
            >
              {page}
            </button>
          )
        )}

        <button
          className={`px-3 py-1 bg-transparent rounded flex items-center ${
            currentPage === totalPages 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-[rgba(var(--text))] hover:bg-[rgba(var(--hover))] cursor-pointer'
          }`}
          disabled={currentPage === totalPages}
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        >
          Next &rarr;
        </button>
      </nav>
    </div>
  );
};

export default Pagination;