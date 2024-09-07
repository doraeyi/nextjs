'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const DynamicBreadcrumb = () => {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(segment => segment);

  // 創建一個映射來處理特殊情況
  const segmentMappings = {
    'home': '首頁',
    'dedicated': '專屬用戶',
    'profile': '個人資料',
    // 添加其他需要的映射
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <Link href="/" passHref legacyBehavior>
            <BreadcrumbLink>首頁</BreadcrumbLink>
          </Link>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        
        {pathSegments.map((segment, index) => {
          const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
          const isLast = index === pathSegments.length - 1;
          const displayName = segmentMappings[segment] || segment;

          return (
            <React.Fragment key={href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{displayName}</BreadcrumbPage>
                ) : (
                  <Link href={href} passHref legacyBehavior>
                    <BreadcrumbLink>{displayName}</BreadcrumbLink>
                  </Link>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default DynamicBreadcrumb;
