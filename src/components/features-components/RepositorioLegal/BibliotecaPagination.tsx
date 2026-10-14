"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BibliotecaPaginationProps {
  totalCount: number;
  lastPage: number;
  /** Página 1-based (como meta.page del API). */
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  itemLabel?: string;
}

export function BibliotecaPagination({
  totalCount,
  lastPage,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  itemLabel = "registros",
}: BibliotecaPaginationProps) {
  const safeLastPage = Math.max(lastPage, 1);

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
      <div className="flex flex-1 flex-wrap items-center gap-4 text-sm text-text-muted-dark">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-heading-dark">Filas por página</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              onPageSizeChange(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px] border-slate-200">
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm font-medium">
          Total: {totalCount} {itemLabel}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="hidden h-8 w-8 border-slate-200 p-0 lg:flex"
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
        >
          <span className="sr-only">Primera página</span>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 border-slate-200 p-0"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <span className="sr-only">Página anterior</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: safeLastPage }, (_, i) => i + 1).map((pageNum) => {
            if (
              safeLastPage > 7 &&
              pageNum !== 1 &&
              pageNum !== safeLastPage &&
              Math.abs(pageNum - page) > 1
            ) {
              if (Math.abs(pageNum - page) === 2) {
                return (
                  <span key={pageNum} className="px-1 text-text-muted-dark">
                    …
                  </span>
                );
              }
              return null;
            }

            return (
              <Button
                key={pageNum}
                variant={page === pageNum ? "default" : "outline"}
                className={
                  page === pageNum
                    ? "h-8 w-8 bg-navy p-0 text-white hover:bg-navy-hover"
                    : "h-8 w-8 border-slate-200 p-0"
                }
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          className="h-8 w-8 border-slate-200 p-0"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= safeLastPage}
        >
          <span className="sr-only">Página siguiente</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="hidden h-8 w-8 border-slate-200 p-0 lg:flex"
          onClick={() => onPageChange(safeLastPage)}
          disabled={page >= safeLastPage}
        >
          <span className="sr-only">Última página</span>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
