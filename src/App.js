import React from "react";
import Routers from "./route/route";
import { ThemeProvider } from "./components/theme/themeContext";
import Background from "./components/theme/background";

class App extends React.Component {
  render() {
    return (
      <div>
        <ThemeProvider>
          <Background>
            <Routers />
          </Background>
        </ThemeProvider>
      </div>
    );
  }
}

export default App;
