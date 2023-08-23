import './App.css'
import axios from 'axios'
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom'
function App() {
  const navigate = useNavigate();
  const meetLink = useRef<HTMLInputElement>(null);

  const createMeet = async () => {
    const res = await axios.get(`${import.meta.env.VITE_PUBLIC_API_KEY}/meet/create`)
    navigate(`/meet/${res.data.meetId}`)
  }

  const joinMeet = () => {
    if (!meetLink.current?.value) return alert('Please enter a meet link');
    navigate(`/meet/${meetLink.current?.value}`)
  }

  return (
    // <ReactPlayer url={myStream} playing={true} muted={true} height='100%' width='100%' />
    <div className='h-screen flex flex-col justify-center items-center'>
      <div className=' flex  flex-col justify-center gap-8 items-center w-[20rem] h-[20rem] rounded-3xl text-secondary bg-neutral'>
        <div className='flex gap-5'>
          <button onClick={createMeet} className='h-10 bg-gray-dark p-2 rounded-2xl hover:bg-primary hover:text-neutral transition-colors duration-300'>Create Meet</button>
          <button onClick={joinMeet} className='h-10 bg-gray-dark p-2 rounded-2xl hover:bg-primary hover:text-neutral transition-colors duration-300'>Join Meet</button>
        </div>
        <div>
          <input ref={meetLink} required className='h-8  rounded-3xl text-base-100 outline-none focus:border-solid focus:border-2 focus:border-primary' type='text' />
        </div>
      </div>
    </div>
  )
}

export default App
