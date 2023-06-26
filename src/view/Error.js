import React from "react";
import Layout from "../Layout";
// import Sidebar from "../components/errorsidebar";
const Error = () => {
  return (
    <>
      <div >
       
       <Container
         fluid="xs"
         id="stake"
        >
    <img
        style={{
            width:"100%", 
            height:250
          }}
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7eV7ciJFGmfq1i1gbZjrZvD7Vk6opG-cx9w&usqp=CAU"
        alt="learning"

      />
      <br/>
      <br/>
      <h2>Learning</h2>
      </Container>
      <hr
    style={{
      backgroundColor: 'blue',
      height: 2,
      width: 150
    }}
  />
     </div>
    </>
  );
};
export default Error;
