

import {Pagination,PaginationContent,PaginationEllipsis,PaginationItem,PaginationLink,PaginationNext,PaginationPrevious,} from "@/components/ui/pagination"
import Link from 'next/link';

const dedicated = () => {
 

  return (
    <div className="flex flex-col min-h-screen">
    
  <>
  <main className="flex-grow p-4">
  <Link href="/dedicated/questionbank" className="text-blue-500 hover:underline">
        新增題庫
      </Link>
    <hr />
      <Link href="/dedicated/practice" className="text-blue-500 hover:underline">
        自我練習
      </Link>
      <hr />
      <Link href="/dedicated/transcript" className="text-blue-500 hover:underline">
        學期成績單
      </Link>
      <hr />
      <Link href="/dedicated/bookkeeping" className="text-blue-500 hover:underline">
        記帳
      </Link>
      <hr />
      <Link href="/dedicated/Game" className="text-blue-500 hover:underline">
        過年遊戲
      </Link>
      </main>
      </>
  <>
  <footer className="p-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </footer>
  </>
  
  </div>
 
  
);


}

export default dedicated