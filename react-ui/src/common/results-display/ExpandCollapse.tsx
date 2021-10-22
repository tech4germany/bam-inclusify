import { FC, useRef, useEffect, useState } from "react";
import styled from "styled-components";

export const ExpandCollapse: FC<{ isExpanded: boolean }> = ({ isExpanded, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const measurerRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef(0);
  const [computedHeight, setComputedHeight] = useState<number>();
  useEffect(() => {
    heightRef.current = measurerRef.current?.scrollHeight || 0;
    setComputedHeight(measurerRef.current?.scrollHeight || 0);
  }, []);

  return (
    <ExpandCollapseContainer
      ref={containerRef}
      style={{ height: !isExpanded ? "0" : typeof computedHeight === "number" ? computedHeight + "px" : "auto" }}
    >
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
