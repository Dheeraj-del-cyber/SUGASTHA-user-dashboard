import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalCardSectionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badgeText?: string;
  actionText?: string;
  onActionClick?: () => void;
  pastelBg?: string; // Optional pastel background tint for section header badge/icon
  children: React.ReactNode;
  itemMinWidth?: string; // e.g., '280px', '150px'
}

export const HorizontalCardSection: React.FC<HorizontalCardSectionProps> = ({
  title,
  subtitle,
  icon,
  badgeText,
  actionText,
  onActionClick,
  pastelBg = '#DDF4FF',
  children,
  itemMinWidth = '280px',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [children]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="horizontal-section-wrapper">
      {/* Section Header */}
      <div className="section-header-row">
        <div className="section-title-group">
          {icon && (
            <div
              className="section-icon-badge"
              style={{ backgroundColor: pastelBg }}
            >
              {icon}
            </div>
          )}
          <div>
            <div className="title-with-badge">
              <h2 className="section-main-title">{title}</h2>
              {badgeText && (
                <span
                  className="section-mini-badge"
                  style={{ backgroundColor: pastelBg }}
                >
                  {badgeText}
                </span>
              )}
            </div>
            {subtitle && <p className="section-sub-title">{subtitle}</p>}
          </div>
        </div>

        <div className="section-header-controls">
          {actionText && onActionClick && (
            <button onClick={onActionClick} className="section-action-btn">
              {actionText}
            </button>
          )}

          {/* Nav Arrows for Desktop */}
          <div className="scroll-arrow-buttons">
            <button
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className={`arrow-btn ${!canScrollLeft ? 'disabled' : ''}`}
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              className={`arrow-btn ${!canScrollRight ? 'disabled' : ''}`}
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="horizontal-scroll-track no-scrollbar"
      >
        {React.Children.map(children, (child) => (
          <div
            className="horizontal-scroll-item"
            style={{ minWidth: itemMinWidth, flex: `0 0 ${itemMinWidth}` }}
          >
            {child}
          </div>
        ))}
      </div>

      <style>{`
        .horizontal-section-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          margin-bottom: 1.5rem;
          width: 100%;
        }
        .section-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 0.25rem;
          gap: 0.75rem;
        }
        .section-title-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .section-icon-badge {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--dark-navy-text);
          flex-shrink: 0;
        }
        .title-with-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .section-main-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--dark-navy-text);
        }
        .section-mini-badge {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          color: var(--dark-navy-text);
          text-transform: uppercase;
        }
        .section-sub-title {
          font-size: 0.82rem;
          color: var(--text-muted);
        }
        .section-header-controls {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .section-action-btn {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--brand-primary);
          white-space: nowrap;
          padding: 4px 8px;
          border-radius: var(--radius-xs);
          transition: all var(--transition-fast);
        }
        .section-action-btn:hover {
          background: var(--pastel-light-blue);
        }
        .scroll-arrow-buttons {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .arrow-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--white);
          border: 1px solid var(--border-light);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--dark-navy-text);
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-fast);
        }
        .arrow-btn:hover:not(.disabled) {
          background: var(--pastel-light-blue);
          border-color: var(--pastel-sky-blue);
        }
        .arrow-btn.disabled {
          opacity: 0.4;
          cursor: default;
        }
        .horizontal-scroll-track {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          scroll-behavior: smooth;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          padding: 4px 4px 12px 4px;
        }
        .horizontal-scroll-item {
          scroll-snap-align: start;
          height: 100%;
          display: flex;
        }
        @media (max-width: 640px) {
          .scroll-arrow-buttons {
            display: none;
          }
          .section-main-title {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </section>
  );
};
