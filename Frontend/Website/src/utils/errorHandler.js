export const getErrorMessage = (error) => {
    if (!error) return 'An unexpected error occurred';
    
    if (typeof error === 'string') return error;
    
    if (error instanceof Error) return error.message;
    
    if (error.message) return error.message;
    
    if (error.msg) return error.msg;
    
    if (typeof error === 'object') return JSON.stringify(error);
    
    return 'An unexpected error occurred';
};
