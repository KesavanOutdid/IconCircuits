import { useLazyLoad } from '../hooks/useLazyLoad';

const LazyImage = ({ src, alt, className, style, placeholder = '/img/placeholder.png' }) => {
    const ref = useLazyLoad();

    return (
        <img
            ref={ref}
            data-src={src}
            src={placeholder}
            alt={alt}
            className={className}
            style={style}
        />
    );
};

export default LazyImage;
