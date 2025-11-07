import React from 'react';

export const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={className}
    >
        <path fillRule="evenodd" d="M19.5 2.25a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25H15a.75.75 0 010-1.5h4.5a.75.75 0 00.75-.75V4.5a.75.75 0 00-.75-.75H9a.75.75 0 00-.75.75v1.5a.75.75 0 01-1.5 0v-1.5A2.25 2.25 0 019 2.25h10.5z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M4.5 4.5a2.25 2.25 0 00-2.25 2.25v10.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H4.5zm.75 12a.75.75 0 00.75.75h10.5a.75.75 0 00.75-.75V6.75a.75.75 0 00-.75-.75H5.25a.75.75 0 00-.75.75v10.5z" clipRule="evenodd" />
    </svg>
);