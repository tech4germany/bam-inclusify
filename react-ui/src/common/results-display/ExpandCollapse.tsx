import { FC, useRef, useEffect } from "react";
import styled from "styled-components";

export const ExpandCollapse: FC<{ isExpanded: boolean }> = ({ isExpanded, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const measurerRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef(0);
  useEffect(() => {
    heightRef.current = measurerRef.current?.scrollHeight || 0;
  });

  return (
    <ExpandCollapseContainer ref={containerRef} style={{ height: isExpanded ? heightRef.current + "px" : "0" }}>
      <ExpandCollapseMeasurer ref={measurerRef}>{children}</ExpandCollapseMeasurer>
    </ExpandCollapseContainer>
  );
};

const ExpandCollapseContainer = styled.div`
  overflow-y: hidden;
  transition: height 0.4s ease;
`;

const ExpandCollapseMeasurer = styled.div`
  display: flex;
`;
