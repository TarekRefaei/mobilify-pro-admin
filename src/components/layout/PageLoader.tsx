import { Suspense } from 'react';

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

export const LazyPageWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => <Suspense fallback={<PageLoader />}>{children}</Suspense>;
