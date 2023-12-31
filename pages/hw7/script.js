
"use strict";

class random_function {

    static normaleStandardSaved = undefined;
  
    // Generate Gaussian with the Marsaglia polar method
    static gaussian(Mean, StdDev) {
      if (this.normaleStandardSaved) {
        const normale = Mean + StdDev * this.normaleStandardSaved;
        this.normaleStandardSaved = undefined;
        return normale;
      } else {
        let u, v, s;
        do {
          u = 2 * Math.random() - 1;
          v = 2 * Math.random() - 1;
          s = u * u + v * v;
        } while (s >= 1 || s === 0);
        s = Math.sqrt(-2 * Math.log(s) / s);
        this.normaleStandardSaved = v * s;
        return Mean + StdDev * u * s;
      }
    }
  }

  class rectangular {

    constructor(x, y, width, height) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }
    
    left() {
        return this.x
      }
    
      top() {
        return this.y
      }
    
      right() {
        return this.x + this.width
      }
    
      bottom() {
        return this.y + this.height
      }
    
      aspectRatio() {
        return this.width / this.height || 1
        //converto Nan a 1
      }
    draw_rectangular(ctx, Colore, Spessore, lineDash) {
  
      ctx.save();
      ctx.beginPath();
      ctx.rect(this.x, this.y, this.width, this.height);
      ctx.strokeStyle = Colore;
      ctx.lineWidth = Spessore;
      ctx.setLineDash(lineDash);
      ctx.stroke();
      ctx.restore()
  
    }
  
  
  }
  

//enum per scegliere il tipo di grandezza da rappresentare
const ChosenVariate = Object.freeze({
    BROWNIAN_MOTION_STANDARD: Symbol("brownianMotion_Standard"),
    BROWNIAN_MOTION_GENERAL: Symbol("brownianMotion"),
    BROWNIAN_MOTION_GEO: Symbol("brownianMotion_Geometric"),
    ORNSTEIN_UHLENBECK: Symbol("ornsteinUhlenbeck"),
    BLACK_KARASINSKI: Symbol("blackKarasinski"),
    COX_INGERSOLL_ROSS: Symbol("coxIngersollRoss"),
    BERNOULLI: Symbol("bernoulli")
});

// Get the options from the control panel
const buttonRecompute = document.getElementById("buttonRecompute");
const inputMu = document.getElementById("inputMu");
const inputSigma = document.getElementById("inputSigma");
const inputLambda = document.getElementById("inputLambda");
const inputTimes = document.getElementById("inputTimes");
const inputPaths = document.getElementById("inputPaths");
const inputTheta = document.getElementById("inputTheta");

// Get the radio for the desired stochastic process (SDE)
const check_BROWNIAN_MOTION_STANDARD = document.getElementById("check_BROWNIAN_MOTION_STANDARD");
const check_BROWNIAN_MOTION_GEN = document.getElementById("check_BROWNIAN_MOTION_GEN");
const check_BROWNIAN_MOTION_GEO = document.getElementById("check_BROWNIAN_MOTION_GEO");
const check_ORNSTEIN_UHLENBECK = document.getElementById("check_ORNSTEIN_UHLENBECK");
const check_VASICEK = document.getElementById("check_VASICEK");
const check_BERNOULLI = document.getElementById("check_BERNOULLI");
const check_BLACK_KARASINSKI = document.getElementById("check_BLACK_KARASINSKI");
//const check_CIR = document.getElementById("check_CIR");
const check_POISSON = document.getElementById("check_POISSON");
const check_RANDOM_WALK = document.getElementById("check_RANDOM_WALK");

const Graphic = document.getElementById("Graphic");
const ctx = Graphic.getContext("2d");

let mu, sigma, lambda, n, theta;
let numberOfSamplePaths;
let allPaths;
let myRandomJump;
let myVariate;
let representAsScalingLimit;
let myProcessValueType;
let myProcessValueDescription;
let myVariate_MinView;
let myVariate_MaxView;
let myProcessValue_Range;
let intervalSize;
let NumberOfClasses;
let x_Origin;
let y_Origin;
let timeForHistogram_t;
let timeForHistogram_n;
let avgAtLastTime;              
let ssAtLastTime;               
let intervals_t;                
let intervals_n;                
let currentPathNumber;
let mul = false;

const rectChart = new rectangular(20, 30, Graphic.width - 200, Graphic.height - 30 - 40);

buttonRecompute.onclick = mainTask;

mainTask();

function getUserInput() {

    mu = Number(inputMu.value);
    sigma = Number(inputSigma.value);
    lambda = Number(inputLambda.value);
    theta = Number(inputTheta.value);
    n = Math.round(Number(inputTimes.value));  
    numberOfSamplePaths = Number(inputPaths.value);
    NumberOfClasses = Math.max(100, numberOfSamplePaths / 60);

    timeForHistogram_t = Math.round(n / 2);
    timeForHistogram_n = n;

    const sigmaMultipleForRange = 4;

    const dt = 1 / n;
    const sigma_sqrt_dt = sigma * Math.sqrt(dt);  
    const sqrt_dt = Math.sqrt(dt);

    if (check_BROWNIAN_MOTION_STANDARD.checked) {
        myProcessValueDescription = 'Standard BM ≈ Σ N(0, dt), where dt=1/n, mean=0, var=1 at last time n, taken as 1';
        myProcessValueType = ChosenVariate.BROWNIAN_MOTION_STANDARD;
        representAsScalingLimit = true;
        myVariate_MinView = -sigmaMultipleForRange;
        myVariate_MaxView = sigmaMultipleForRange;
        myRandomJump = () => random_function.gaussian(0, sqrt_dt);
        myVariate = (sumOfJumps) => sumOfJumps;
        mul = false;

    } else if (check_BROWNIAN_MOTION_GEN.checked) {
        myProcessValueDescription = "general (arithmetic) Brownian motion ≈ Σ N(μ dt, σ² dt), where dt=1/n, mean=μ, var=σ² at last time n, taken as 1";
        myProcessValueType = ChosenVariate.BROWNIAN_MOTION_GENERAL;
        representAsScalingLimit = true;
        myVariate_MinView = Math.min(0, mu - sigmaMultipleForRange * sigma);
        myVariate_MaxView = Math.max(0, mu + sigmaMultipleForRange * sigma);
        myRandomJump = () => random_function.gaussian(mu * dt, sigma_sqrt_dt);
        myVariate = (sumOfJumps) => sumOfJumps;
        mul = false;

    } else if(check_BROWNIAN_MOTION_GEO.checked){
        myProcessValueDescription = "Geometric Brownian motion ≈ S_t = S_0 exp((μ - σ²/2)dt + σ W_t), where W_t is a standard BM))";
        myProcessValueType = ChosenVariate.BROWNIAN_MOTION_GEO;
        representAsScalingLimit = true;
        myVariate_MinView = 0;
        myVariate_MaxView = Math.exp((mu + 3 * sigma) * n * dt);
        myRandomJump = () => Math.exp(random_function.gaussian((mu - sigma * sigma /2) * dt, sigma_sqrt_dt));
        myVariate = (productOfJumps) => productOfJumps;
        mul = true;
    
    } else if(check_ORNSTEIN_UHLENBECK.checked){
        let currentValue = 0;
        myProcessValueDescription = "Ornstein-Uhlenbeck process ≈ dX_t = θ(μ - X_t)dt + σ dW_t, where W_t is a standard BM";
        myProcessValueType = ChosenVariate.ORNSTEIN_UHLENBECK;
        representAsScalingLimit = false;
        myVariate_MinView = Math.min(0, mu - sigmaMultipleForRange * sigma);
        myVariate_MaxView = Math.max(0, mu + sigmaMultipleForRange * sigma);
        myRandomJump = () => theta * (mu - currentValue) * dt + sigma * Math.sqrt(dt) * random_function.gaussian(0, 1);
        myVariate = (sumOfJumps, t) => {
          currentValue += sumOfJumps;
          return sumOfJumps + theta * (mu - sumOfJumps) * dt;
        };
        mul = false;

    } else if (check_BERNOULLI.checked) {
      myProcessValueDescription = "Bernoulli process ≈ Σ Bernoulli(p), where p=0.5, mean=n/2, var=n/4 at last time n, taken as 1";
      myProcessValueType = ChosenVariate.BERNOULLI;
      representAsScalingLimit = true;
      myVariate_MinView = -10;
      myVariate_MaxView = 100;
      const p = 0.5;
      myRandomJump = () => (Math.random() < p) ? 1 : 0;
      myVariate = (sumOfJumps) => sumOfJumps;
      mul = false;

    } else if(check_RANDOM_WALK.checked) {
      myProcessValueDescription = "Random walk ≈ Σ Bernoulli(0.5) - 0.5, where mean=0, var=n/4 at last time n, taken as 1";
      myProcessValueType = ChosenVariate.RANDOM_WALK;
      representAsScalingLimit = true;
      myVariate_MinView = -100;
      myVariate_MaxView = 100;
      myRandomJump = () => (Math.random() < 0.5) ? 1 : -1;
      myVariate = (sumOfJumps) => sumOfJumps;
      mul = false;
    } 

  else if(check_POISSON.checked){
  myProcessValueDescription = "Poisson process ≈ Σ Poisson(λ dt), where dt=1/n, mean=λ, var=λ at last time n, taken as 1";
  myProcessValueType = ChosenVariate.POISSON;
  representAsScalingLimit = true;
  
  // Adjust these based on the range you want to visualize
  myVariate_MinView = 0;
  myVariate_MaxView = 100;
  
  // Random jump function for Poisson process
  myRandomJump = () => {
      const poissonLambda = lambda * dt;
      let count = 0;
      let cumulativeProbability = Math.exp(-poissonLambda);
  
      while (Math.random() > cumulativeProbability) {
          count++;
          cumulativeProbability += Math.exp(-poissonLambda) * poissonLambda / count;
      }
  
      return count;
  };
  
  // Define the variate function
  myVariate = (sumOfJumps) => sumOfJumps;
  
  // Assuming mul is a variable used elsewhere in your code
  mul = false;
}

    const inputSDE = document.getElementById("inputSDE");
    inputSDE.value = myProcessValueDescription;

    myProcessValue_Range = myVariate_MaxView - myVariate_MinView;
    intervalSize = myProcessValue_Range / NumberOfClasses;

    [x_Origin, y_Origin] = for2d.transformXYToViewport([0, 0], 0, n, myVariate_MinView, myProcessValue_Range, rectChart);

}

function mainTask() {

    getUserInput();     //acquisizione nuove scelte
    intervals_t = [];               //intervalli per distribuzione tempo intermedio
    intervals_n = [];               //intervalli per distribuzione tempo finale
    currentPathNumber = 0;
    avgAtLastTime = 0;              //media della variata al tempo n
    ssAtLastTime = 0;               //somma quadrati della variata al tempo n
    ctx.clearRect(0, 0, Graphic.width, Graphic.height);
    allPaths = [];



        //generazione sample paths
        for (let s = 1; s <= numberOfSamplePaths; s++) {
            const newPath = createSinglePath(s);
            allPaths.push(newPath);
            ctx.lineWidth = 1;
            ctx.strokeStyle = forChart.randomColorCSS();
            ctx.stroke(newPath);
        }

        sovrapponiIstogrammi();

}

function sovrapponiIstogrammi() {

    //rettangolo contenitore istogramma
    const rettangoloIstogramma_t = new rectangular(for2d.transformX(timeForHistogram_t, 0, n, rectChart.x, rectChart.width), rectChart.y, 150, rectChart.height);
    const rettangoloIstogramma_n = new rectangular(for2d.transformX(timeForHistogram_n, 0, n, rectChart.x, rectChart.width), rectChart.y, 150, rectChart.height);

    //istogrammi
    forChart.verticalHistoFromIntervals(ctx, intervals_t, myVariate_MinView, myVariate_MaxView - myVariate_MinView, rettangoloIstogramma_t, "Silver", 1, "Silver");
    forChart.verticalHistoFromIntervals(ctx, intervals_n, myVariate_MinView, myVariate_MaxView - myVariate_MinView, rettangoloIstogramma_n, "Silver", 1, "Silver");

}

function createSinglePath(s) {

    currentPathNumber = s;
    const myPath = new Path2D();

    let sumOfJumps = mul ? 1 : 0;
    let previousY_Variate = y_Origin;

    myPath.moveTo(x_Origin, y_Origin);   //visualmente facciamo partire la path dall'origine

    for (let t = 1; t <= n; t++) {

        sumOfJumps = mul ? sumOfJumps * myRandomJump(sumOfJumps) : sumOfJumps + myRandomJump(sumOfJumps);
        console.log(sumOfJumps);
        let myProcessValue = myVariate(sumOfJumps, t);

        //raccolta valori per istogramma
        if (t === timeForHistogram_t) {
            forDistribution.allocateValueInIntervals(myProcessValue, intervals_t, intervalSize);
        } else if (t === timeForHistogram_n) {
            forDistribution.allocateValueInIntervals(myProcessValue, intervals_n, intervalSize);
            [avgAtLastTime, ssAtLastTime] = forDistribution.UpdateMeanAndSS(myProcessValue, s, [avgAtLastTime, ssAtLastTime]);
        }

        const ascissa_t = for2d.transformX(t / n, 0, 1, rectChart.x, rectChart.width);

        //const ascissa_t = for2d.transformX(t, 0, n, rectChart.x, rectChart.width);
        const ordinata = for2d.transformY(myProcessValue, myVariate_MinView, myProcessValue_Range, rectChart.y, rectChart.height);
        myPath.lineTo(ascissa_t, previousY_Variate);
        previousY_Variate = ordinata;

        myPath.lineTo(ascissa_t, ordinata);
    }

    return myPath;

}

