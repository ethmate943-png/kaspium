import React from "react";

interface MobileContainerProps {
  children: React.ReactNode;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
}) => {
  return <div className="app-shell">{children}</div>;
};
