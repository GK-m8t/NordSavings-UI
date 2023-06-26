import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Dashboard from "../view/DashBoard";
import Advisory from "../view/Advisory";
import Error from "../view/Error";

class PublicRoute extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={Dashboard}></Route>
          <Route exact path="/advisory" component={Advisory}></Route>
          <Route component={Error} />
        </Switch>
      </Router>
    );
  }
}

export default PublicRoute;
