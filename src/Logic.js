// Activation function options and their derivatives
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function derivativeSigmoid(x) {
  const fx = sigmoid(x);
  return fx * (1 - fx);
}

function relu(x) {
  return Math.max(0, x);
}

function derivativeRelu(x) {
  return x > 0 ? 1 : 0;
}

// Softmax function
function softmax(arr) {
  const max = Math.max(...arr);
  const exps = arr.map(e => Math.exp(e - max));
  const sum = exps.reduce((a, b) => a + b);
  return exps.map(e => e / sum);
}
function tan(x) {
  return Math.tanh(x);
}

function derivativeTan(x) {
  return 1 - Math.pow(tan(x), 2);
}

// Initialize weights and biases dynamically
 export function initializeNetwork(numInputNeurons, numHiddenNeurons, numOutputNeurons, activationFunctionName) {
  let weights_input_hidden = Array.from({ length: numInputNeurons }, () => Array.from({ length: numHiddenNeurons }, Math.random));
  let weights_hidden_output = Array.from({ length: numHiddenNeurons }, () => Array.from({ length: numOutputNeurons }, Math.random));
  let bias_hidden = Array.from({ length: numHiddenNeurons }, Math.random);
  let bias_output = Array.from({ length: numOutputNeurons }, Math.random);

  let activationFunction, derivativeFunction;
  if (activationFunctionName === 'relu') {
      activationFunction = relu;
      derivativeFunction = derivativeRelu;
  } else if(activationFunctionName === 'sigmoid') {
      activationFunction = sigmoid; // default
      derivativeFunction = derivativeSigmoid;
  }
  else{
    activationFunction = tan; // default
    derivativeFunction = derivativeTan;
  }


  return { weights_input_hidden, weights_hidden_output, bias_hidden, bias_output, activationFunction, derivativeFunction };
}

// Forward pass through the hidden layer
function forwardPassHiddenLayer(input, network) {
  let hidden = Array(network.bias_hidden.length).fill(0);
  for (let i = 0; i < hidden.length; i++) {
      for (let j = 0; j < input.length; j++) {
          hidden[i] += input[j] * network.weights_input_hidden[j][i];
      }
      hidden[i] += network.bias_hidden[i];
      hidden[i] = network.activationFunction(hidden[i]);
  }
  return hidden;
}

// Forward pass through the output layer
function forwardPassOutputLayer(hidden, network) {
  let output = Array(network.bias_output.length).fill(0);
  for (let i = 0; i < output.length; i++) {
      for (let j = 0; j < hidden.length; j++) {
          output[i] += hidden[j] * network.weights_hidden_output[j][i];
      }
      output[i] += network.bias_output[i];
  }
  output = softmax(output);
  return output;
}

// Complete forward pass
function forwardPass(input, network) {
  const hidden = forwardPassHiddenLayer(input, network);
  const output = forwardPassOutputLayer(hidden, network);
  return output;
}

// MSE loss function
function mse_loss(outputs, targets) {
  let sum = 0;
  for (let i = 0; i < outputs.length; i++) {
      sum += Math.pow(outputs[i] - targets[i], 2);
  }
  return sum / outputs.length;
}

// Backpropagation
function backpropagate(input, hidden, output, expected, network, learningRate) {
  const outputErrors = output.map((o, i) => o - expected[i]);

  // Update weights for hidden-output
  for (let i = 0; i < network.weights_hidden_output.length; i++) {
      for (let j = 0; j < network.weights_hidden_output[i].length; j++) {
          const gradient = outputErrors[j] * network.derivativeFunction(output[j]);
          network.weights_hidden_output[i][j] -= learningRate * gradient * hidden[i];
      }
  }

  // Update weights for input-hidden
  for (let i = 0; i < network.weights_input_hidden.length; i++) {
      for (let j = 0; j < network.weights_input_hidden[i].length; j++) {
          const hiddenError = outputErrors.reduce((acc, err, k) => acc + err * network.weights_hidden_output[j][k], 0);
          const gradient = hiddenError * network.derivativeFunction(hidden[j]);
          network.weights_input_hidden[i][j] -= learningRate * gradient * input[i];
      }
  }

  // Update biases
  for (let i = 0; i < network.bias_hidden.length; i++) {
      const hiddenError = outputErrors.reduce((acc, err, k) => acc + err * network.weights_hidden_output[i][k], 0);
      network.bias_hidden[i] -= learningRate * hiddenError * network.derivativeFunction(hidden[i]);
  }
  for (let i = 0; i < network.bias_output.length; i++) {
      network.bias_output[i] -= learningRate * outputErrors[i] * network.derivativeFunction(output[i]);
  }
}

// Normalize function
export function normalize(value, min, max) {
  return (value - min) / (max - min);
}

// Training function
export function train(data, labels, epochs, learningRate, network, learningGoal) {
  for (let epoch = 0; epoch < epochs; epoch++) {
      let totalLoss = 0;

      for (let i = 0; i < data.length; i++) {
          const hidden = forwardPassHiddenLayer(data[i], network);
          const output = forwardPassOutputLayer(hidden, network);
          backpropagate(data[i], hidden, output, labels[i], network, learningRate);
          totalLoss += mse_loss(output, labels[i]);
      }

      let averageLoss = totalLoss / data.length;
    
   
      // Check if learning goal is achieved
      if (averageLoss <= learningGoal) {
     
          console.log(`Learning goal achieved at epoch ${epoch + 1}`);
          break;
      }
    
  }
}

// Example of using the network for prediction
export function predictFruit(colorValue, sweetnessValue, network) {
  let color = normalize(colorValue, 1, 3); // Red = 1, Orange = 2, Yellow = 3
  let sweetness = normalize(sweetnessValue, 1, 10); // Sweetness scale: 1-10
  let input = [color, sweetness];
  let prediction = forwardPass(input, network);
console.log(prediction)
  let fruits = ['Apple', 'Orange', 'Banana'];
  let maxIndex = prediction.indexOf(Math.max(...prediction));
  return fruits[maxIndex];
}

// // User choice for number of hidden neurons and activation function
const numHiddenNeurons = 100; 
const activationFunctionChoice = 'sigmoid'; 
const ephocs = 1000;
const LR = 0.1;
const learningGoal = 0.05;
// Initializing the network
const network = initializeNetwork(2, numHiddenNeurons, 3, activationFunctionChoice);

// Training data
const data = [
  [normalize(1, 1, 3), normalize(5, 1, 10)],
  [normalize(2, 1, 3), normalize(2, 1, 10)], // Orange
  [normalize(3, 1, 3), normalize(9, 1, 10)]  // Banana
];
 const labels = [
 
  [1, 0, 0], // Apple
  [0, 1, 0], // Orange
  [0, 0, 1]  // Banana
];

// Train the network
train(data, labels, ephocs, LR, network); // Train for 1000 epochs with a learning rate of 0.1

// Example prediction
console.log(predictFruit(3, 9, network)); // Predict for an orange with sweetness level 4
