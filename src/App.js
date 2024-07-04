import React, { useEffect, useState } from 'react'
import {Box, Typography} from '@mui/material'
import '../src/Css/input.css'
import { train, predictFruit, initializeNetwork, normalize } from './Logic';
import axios from 'axios';

export default function App() {
  const [data, setData] = useState([]);
  const [labels,setLabels] =useState([]);
  const [network, setNetwork] = useState(null);
  const [sweetness, setSweetness] = useState('');
  const [entrySweetness, setEntrySweetness] = useState('');
  const [color, setColor] = useState('');
  const [entryColor, setEntryColor] = useState('');
  const [hiddenNodes, setHiddenNodes] = useState('');
  const [activationFunction, setActivationFunction] = useState('');
  const [learningRate, setLearningRate] = useState('');
  const [goal, setGoal] = useState('');
  const [epochs, setEpochs] = useState('');
  const [prediction, setPrediction] = useState('');


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/data'); // Replace with your backend URL
        const newData = [];
        const newLabels = [];
  
        response.data.forEach(item => {
          // Normalize or transform data as required
          const normalizedSweetness = normalize(item.sweetness, 1, 10);
          const normalizedColor = normalize(item.color, 1, 3); // Assuming color values are in the range 1-3
          newData.push([normalizedColor, normalizedSweetness]);
  
          // Create labels based on some logic, e.g., based on color
          let label;
          switch (item.color) {
            case 1:
              label = [1, 0, 0];
              break;
            case 2:
              label = [0, 1, 0];
              break;
            case 3:
              label = [0, 0, 1];
              break;
            default:
              label = [0, 0, 0]; // Default label for unexpected values
          }
          newLabels.push(label);
        });
  
        // Update states
        setData(prevData => [...prevData, ...newData]);
        setLabels(prevLabels => [...prevLabels, ...newLabels]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []); // Dependency array is empty to run only once when the component mounts
  
const predict=()=>{
  setPrediction(predictFruit(color,sweetness,network)) 
}
const addData = () => {
  console.log(data)
  console.log(labels)
  
  const normalizedSweetness = normalize(entrySweetness, 1, 10);
  const normalizedColor = normalize(entryColor, 1, 3); 

  
  setData(prevData => [...prevData, [normalizedColor, normalizedSweetness]]);
  let label;
  switch (entryColor) {
    case '1':
      label = [1, 0, 0];
      break;
    case '2':
      label = [0, 1, 0];
      break;
    case '3':
      label = [0, 0, 1];
      break;
    default:
      label = [0, 0, 0]; 
  }
  setLabels(prevLabels => [...prevLabels, label]);

};

const configure = () => {
  const numInputNeurons = 2; // Assuming 2 input neurons (color and sweetness)
  const numOutputNeurons = 3; // Assuming 3 output neurons (Apple, Orange, Banana)
  
  // Initialize the network based on the user inputs
  const initializedNetwork = initializeNetwork(
    numInputNeurons, 
    parseInt(hiddenNodes), 
    numOutputNeurons, 
    activationFunction
  );

  setNetwork(initializedNetwork);
};
const handleTrain = () => {
  if (!network || data.length === 0) {
    console.error("Network is not initialized or data is empty.");
    return;
  }

  // Use only as many labels as there are data points, cycling through them
 

  // Call the train function
 train(data, labels, parseInt(epochs), parseFloat(learningRate), network, parseFloat(goal));

console.log(data)

};
useEffect(()=>{
 console.log(network)
},[network])

  return (
    <Box width="100vw" height="100vh" display="flex" justifyContent="center" alignItems="center" sx={{backgroundColor:"#ced4ed"}} gap={3}>
      <Box  display="flex"  flexDirection="column" gap={3}>

    
      <Box display="flex" justifyContent="center" flexDirection="column" textAlign="center" gap={2} sx={{  borderBottom:"1px solid #a7aaab",padding:"5px"}}>
      <Typography  fontSize="25px" sx={{ fontFamily: 'Roboto', fontWeight: "300" }}> Inputs </Typography>
      <Box display="flex" gap={1}>
      
                    {/* test */}
     
      <div class="form-control">
          <input class="input input-alt"  value={sweetness} placeholder="Sweetness (1-10)" required="true" type="text"   onChange={(e) => setSweetness(e.target.value)}/>
          <span class="input-border input-border-alt"> </span>
        </div>
        <div class="form-control">
          <input class="input input-alt" placeholder="Color" value={color} required="true" type="text"onChange={(e) => setColor(e.target.value)}/>
          <span class="input-border input-border-alt"> </span>
        </div>
        <button class="button" style={{width:"20%",margin:"0 auto"}} onClick={predict}> Predict 
                      </button>
      </Box>
        <Typography   fontSize="25px" sx={{ fontFamily: 'Roboto', fontWeight: "600" }}> Prediction :{prediction} </Typography>
      </Box>
            <Box display="flex" justifyContent="center" flexDirection="column" textAlign="center" gap={2}  sx={{padding:"5px"}}>  
                <Box display="flex" flexDirection="column" gap={2}  textAlign="center">
                <Typography   fontSize="25px" sx={{ fontFamily: 'Roboto', fontWeight: "600" }}> Data entry </Typography>
                  <Box display="flex">
                                {/* Entry Sec */}
                
                  <div class="form-control">
                      <input class="input input-alt" placeholder="Sweetness (1-10)" required="true" type="text"  value={entrySweetness} onChange={(e) => setEntrySweetness(e.target.value)}/>
                      <span class="input-border input-border-alt"> </span>
                    </div>
                    <div class="form-control">
                    <input class="input input-alt" placeholder="color" required="true" type="text"  value={entryColor} onChange={(e) => setEntryColor(e.target.value)}/>
                      <span class="input-border input-border-alt"> </span>
                    </div>
                    <Box>
                  <button
                  title="Add New"
                  class="group cursor-pointer outline-none hover:rotate-90 duration-300"
                  onClick={()=>addData()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="50px"
                    height="50px"
                    viewBox="0 0 24 24"
                    class="stroke-green-400 fill-none group-hover:fill-green-800 group-active:stroke-green-200 group-active:fill-green-600 group-active:duration-0 duration-300"
                  >
                    <path
                      d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
                      stroke-width="1.5"
                    ></path>
                    <path d="M8 12H16" stroke-width="1.5"></path>
                    <path d="M12 16V8" stroke-width="1.5"></path>
                  </svg>
                </button>
                  </Box>
                     </Box>
                     <Typography   fontSize="25px" sx={{ fontFamily: 'Roboto', fontWeight: "600" }}> Config : </Typography>
                     <Box display="flex" gap={2}>
                              {/* Config */}
                      <div class="form-control">
                        <input class="input input-alt" placeholder="Hidden Nodes" required="true" value={hiddenNodes} type="text" onChange={(e) => setHiddenNodes(e.target.value)}/>
                        <span class="input-border input-border-alt"> </span>
                      </div>
                      <div class="form-control">
                        <input class="input input-alt" placeholder="Activation Fun" value={activationFunction} onChange={(e) => setActivationFunction(e.target.value)} required="true" type="text"/>
                        <span class="input-border input-border-alt"> </span>
                      </div>
                     </Box>
                     <Box display="flex" gap={2}>

                      <div class="form-control">
                        <input class="input input-alt" placeholder="LR" value={learningRate} onChange={(e) => setLearningRate(e.target.value)} required="true" type="text"/>
                        <span class="input-border input-border-alt"> </span>
                      </div>
                      <div class="form-control">
                        <input class="input input-alt" placeholder="Goal" value={goal} onChange={(e) => setGoal(e.target.value)} required="true" type="text"/>
                        <span class="input-border input-border-alt"> </span>
                      </div>
                     </Box>
                     <div class="form-control" style={{width:"50%",margin:"0 auto"}}>
                        <input class="input input-alt" placeholder="Epochs" value={epochs} onChange={(e) => setEpochs(e.target.value)} required="true" type="text"/>
                        <span class="input-border input-border-alt"> </span>
                      </div>
                     <button class="button" style={{width:"50%",margin:"0 auto"}} onClick={()=>configure()}> Configure 
                      </button>
                      <button class="button" style={{width:"50%",margin:"0 auto"}} onClick={handleTrain}> Train 
                      </button>
                </Box>
                  
            </Box>

            </Box>
    </Box>
  )
}
