# 🎯 Optimizer Visualizer

> A dynamic 3D tool to explore how optimization algorithms traverse a loss surface in real time.

---

## 🌐 Live Demo

👉 [Try it here](https://gradient-descent-vis.netlify.app/)

---

## 🎥 Demo Previews

| 3D Loss Surface | Different optimizers | Custom surface |
|----------------|----------------------------|--------------------------|
| ![Loss Surface](screens/Surfaces.gif) | ![optimizers](screens/Optimizers.gif) | ![Custom surface](screens/Input_plot.gif) |

---

## ✨ Features

- 🧠 Explore optimizers: **SGD**, **Momentum**, **Adagrad**, **RMSProp**, **Adam**
- 📈 Real-time 3D visualizations using **Plotly**
- ✍️ Input custom loss surfaces using different functions
- 🎚️ Adjust hyperparameters: learning rate, momentum, decay, beta values
- ⏯️ Play, pause, reset animations and reinitialize points

---

## 🚀 How to Use

1. **Enter a loss function or select a default surface**, e.g.:  
   `pow(w*w + b - 6, 2) + pow(w + b*b - 5, 2)`
2. **Choose an optimizer** and adjust its parameters
3. **Click or tap** on the plot to place a starting marker
4. Press **Start** to begin optimization
5. **Pause** or **reset** to test different configurations

---

## 🙌 Acknowledgements

This project was built to help learners visually grasp the behavior of optimization algorithms used in deep learning and machine learning.
