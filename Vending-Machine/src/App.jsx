import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';



import NotFound from './pages/NotFound';
import './App.css'



function App() {
  const [count, setCount] = useState(0)


  return (
   
<div>


   <Routes>
     <Route path="/" element={<Home />} />
     <Route path="*" element={<NotFound />} />
   </Routes>
 </div>


  )
}


export default App



