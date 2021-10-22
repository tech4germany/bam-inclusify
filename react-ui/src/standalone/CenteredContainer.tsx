import styled from "styled-components";
import { scrollbarWidth } from "./scrollbar-width";

const centeredSidePaddingPx = 35;
export const CenteredContainer = styled.div`
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 ${centeredSidePaddingPx - scrollbarWidth}px 0 ${centeredSidePaddingPx}px;
  height: 100%;
`;
