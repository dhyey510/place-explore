import React from "react";

import "./SideDrawer.css";
import { CSSTransition } from "react-transition-group";

const SideDrawer = (props) => {
  return (
    <CSSTransition
      in={props.show}
      classNames="slide-in-left"
      timeout={200}
      mountOnEnter
      unmountOnExit
    >
      <aside className="side-drawer" onClick={props.onClick}>
        {props.children}
      </aside>
    </CSSTransition>
  );
};

export default SideDrawer;
