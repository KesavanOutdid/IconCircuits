import React from 'react';
import '../assets/css/FileViewer.css';

const FileViewer = ({ file, type, onClose }) => {
    if (!file) return null;

    const getFileUrl = () => {
        if (file.includes('http')) {
            return file;
        }
        
        const fileName = file.split('\\').pop().split('/').pop();
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem('token');
        
        let url = `${apiUrl}/cart/file?filename=${encodeURIComponent(fileName)}`;
        if (token) {
            url += `&token=${encodeURIComponent(token)}`;
        }
        
        console.log('FileViewer - File path:', file);
        console.log('FileViewer - Extracted filename:', fileName);
        console.log('FileViewer - Full URL:', url);
        console.log('FileViewer - Has token:', !!token);
        return url;
    };

    const getTitle = () => {
        switch(type) {
            case 'image':
                return 'Image View';
            case 'pdf':
                return 'PDF Document';
            default:
                return 'File Viewer';
        }
    };

    const handleOpenPdfNewTab = () => {
        window.open(getFileUrl(), '_blank');
    };

    return (
        <div className="file-viewer-overlay" onClick={onClose}>
            <div className="file-viewer-modal" onClick={(e) => e.stopPropagation()}>
                <div className="file-viewer-header">
                    <h5 style={{color:"white"}}>{getTitle()}</h5>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {type === 'pdf' && (
                            <button 
                                className="btn btn-sm btn-light"
                                onClick={handleOpenPdfNewTab}
                                title="Open in new tab"
                            >
                                <i className="fa fa-external-link"></i> Open
                            </button>
                        )}
                        <button className="btn-close" onClick={onClose}></button>
                    </div>
                </div>
                <div className="file-viewer-content">
                    {type === 'image' ? (
                        <img 
                            src={getFileUrl()} 
                            alt="File Preview" 
                            className="file-viewer-image"
                            onError={(e) => {
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3EImage not found%3C/text%3E%3C/svg%3E';
                            }}
                        />
                    ) : type === 'pdf' ? (
                        <div className="file-viewer-pdf-container">
                            <div className="pdf-placeholder">
                                <i className="fa fa-file-pdf" style={{ fontSize: '3rem', color: '#d32f2f', marginBottom: '1rem' }}></i>
                                <h6>PDF Document</h6>
                                <p style={{ color: '#666', marginBottom: '1.5rem' }}>Click "Open" button to view PDF in a new tab</p>
                                <button 
                                    className="btn btn-primary"
                                    onClick={handleOpenPdfNewTab}
                                >
                                    <i className="fa fa-external-link me-2"></i>Open PDF in New Tab
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="file-viewer-content-error">
                            <p>File type not supported for preview</p>
                            <p style={{ fontSize: '0.9rem', color: '#999' }}>Type: {type}</p>
                            <a href={getFileUrl()} download className="btn btn-primary mt-3">
                                Download File
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileViewer;
