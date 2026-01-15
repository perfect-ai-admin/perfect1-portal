import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Pagination({ 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange, 
  itemsPerPage = 10,
  totalItems = 0 
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  const getPageRange = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return { pages, start, end };
  };

  const { pages, start, end } = getPageRange();

  if (totalPages <= 1) return null;

  return (
    <nav 
      className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 px-4 bg-white rounded-lg border border-gray-200"
      aria-label="עמודיות"
    >
      {/* Info Text */}
      <div className="text-sm text-gray-600 text-center sm:text-right">
        {totalItems > 0 ? (
          <>מציג <span className="font-semibold">{startItem}-{endItem}</span> מתוך <span className="font-semibold">{totalItems}</span> תוצאות</>
        ) : (
          `עמוד ${currentPage} מתוך ${totalPages}`
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2" role="toolbar" aria-label="בקרות עמודיות">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="gap-1"
          aria-label={`עמוד קודם (עמוד ${currentPage - 1})`}
          aria-disabled={currentPage === 1}
        >
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">הקודם</span>
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {start > 1 && (
            <>
              <PageButton 
                page={1} 
                isActive={currentPage === 1}
                onClick={() => onPageChange(1)}
              />
              {start > 2 && <span className="text-gray-400 px-2">...</span>}
            </>
          )}
          
          {pages.map(page => (
            <PageButton
              key={page}
              page={page}
              isActive={currentPage === page}
              onClick={() => onPageChange(page)}
            />
          ))}
          
          {end < totalPages && (
            <>
              {end < totalPages - 1 && <span className="text-gray-400 px-2">...</span>}
              <PageButton 
                page={totalPages} 
                isActive={currentPage === totalPages}
                onClick={() => onPageChange(totalPages)}
              />
            </>
          )}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="gap-1"
          aria-label={`עמוד הבא (עמוד ${currentPage + 1})`}
          aria-disabled={currentPage === totalPages}
        >
          <span className="hidden sm:inline">הבא</span>
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}

function PageButton({ page, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 rounded-lg font-medium transition-all ${
        isActive
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
      aria-label={`עמוד ${page}`}
      aria-current={isActive ? 'page' : undefined}
      disabled={isActive}
    >
      {page}
    </button>
  );
}