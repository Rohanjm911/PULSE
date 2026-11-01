import React from "react";

interface CardProps {
  title?: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  icon: Icon,
  children,
  className = "",
  onClick,
  hoverable = true,
}) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl bg-[#181F29] border border-[#293342] p-5 shadow-sm transition-all duration-200 ${
        hoverable ? "hover:border-[#3A485E] hover:shadow-md hover:bg-[#1B232F]" : ""
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {(title || action || Icon) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-[#202936] border border-[#293342] text-[#00D4FF] shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-sm font-semibold text-[#F4F6F8] tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-[11px] text-[#9AA5B3] mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
