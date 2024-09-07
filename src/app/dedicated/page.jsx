
import {Pagination,PaginationContent,PaginationEllipsis,PaginationItem,PaginationLink,PaginationNext,PaginationPrevious,} from "@/components/ui/pagination"
import Link from 'next/link';

const dedicated = () => {
 

  return (
    <div className="flex flex-col min-h-screen">
    
  <>
  <main className="flex-grow p-4">
  <Link href="/dedicated/questionbank" className="text-blue-500 hover:underline">
        題庫
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