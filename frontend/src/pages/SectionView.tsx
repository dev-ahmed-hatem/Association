import React from "react";
import { Outlet, useMatch } from "react-router";

/* 
Most sections contains parent page that holds a list of items. Each item can be viewed
in a profile page included as a subroute under the parent path. The list is separeated 
from the parent path to prevent the non required load of list items with subsequent
requests of subroutes. As this pattern is repeated, this component is created to hold
the any section that fits this pattern. Render either the list items. with items
fetching query, if the parent component is requested, or subroutes, without need to
fetch the list items, if any subroute is requestd.
*/

const SectionView = ({
  parentComponent,
  parentUrl,
}: {
  parentComponent: React.ReactNode;
  parentUrl: string;
}) => {
  const isParent = useMatch(parentUrl);

  return isParent ? parentComponent : <Outlet />;
};

export default SectionView;
