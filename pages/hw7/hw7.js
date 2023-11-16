"use strict";

    //enum per scegliere il tipo di grandezza da rappresentare
    const MyChosenVariate = Object.freeze({
        RANDOM_WALK: Symbol("randomWalk"),
        RANDOM_WALK_NORM: Symbol("randomWalk_Norm"),
        RANDOM_WALK_RESCALED: Symbol("randomWalk_Rescaled"),
        BROWNIAN_MOTION_STANDARD: Symbol("brownianMotion_Standard"),
        BROWNIAN_MOTION_GENERAL: Symbol("brownianMotion"),
        POISSON: Symbol("Poisson"),
    });

    const buttonRecompute = document.getElementById("buttonRecompute");
    const inputMu = document.getElementById("inputMu");
    const inputSigma = document.getElementById("inputSigma");
    const inputLambda = document.getElementById("inputLambda");
    const inputTimes = document.getElementById("inputTimes");
    const inputPaths = document.getElementById("inputPaths");

    const check_ALL_AT_ONCE = document.getElementById("check_ALL_AT_ONCE");
    const check_ANIMATED = document.getElementById("check_ANIMATED");

    const check_RANDOM_WALK = document.getElementById("check_RANDOM_WALK");
    const check_RANDOM_WALK_NORM = document.getElementById("check_RANDOM_WALK_NORM");
    const check_RANDOM_WALK_RESCALED = document.getElementById("check_RANDOM_WALK_RESCALED");
    const check_BROWNIAN_MOTION_STANDARD = document.getElementById("check_BROWNIAN_MOTION_STANDARD");
    const check_BROWNIAN_MOTION_GEN = document.getElementById("check_BROWNIAN_MOTION_GEN");
    const check_POISSON = document.getElementById("check_POISSON");

    const myCanvas = document.getElementById("myCanvas");
    const ctx = myCanvas.getContext("2d");

    let mu, sigma, lambda, n;
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
    let avgAtLastTime;              //media della variata al tempo n
    let ssAtLastTime;               //somma quadrati della variata al tempo n
    let intervals_t;                //intervalli per distribuzione tempo intermedio
    let intervals_n;                //intervalli per distribuzione tempo finale
    let MyTimer;
    let representAsAnimation;
    let currentPathNumber;

    const rectChart = new Rettangolo(20, 30, myCanvas.width - 200, myCanvas.height - 30 - 40);

    buttonRecompute.onclick = mainTask;

    mainTask();

    function acquisizioneScelteUtente() {

        mu = Number(inputMu.value);
        sigma = Number(inputSigma.value);
        lambda = Number(inputLambda.value);
        n = Math.round(Number(inputTimes.value));  //forzo conversione intero per assicurare l'uguaglianza con l'indice t del loop
        numberOfSamplePaths = Number(inputPaths.value);
        NumberOfClasses = Math.max(100, numberOfSamplePaths / 60);

        timeForHistogram_t = Math.round(n / 2);
        timeForHistogram_n = n;
        representAsAnimation = check_ANIMATED.checked;

        const sigmaMultipleForRange = 4;

        const dt = 1 / n;
        const sigma_sqrt_dt = sigma * Math.sqrt(dt);          //varianza proporzionale al tempo
        const sqrt_dt = Math.sqrt(dt);              //caso di sigma=1

        if (check_RANDOM_WALK.checked) {
            myProcessValueDescription = "Random Walk (sum of scaled Rademacher rv's = Σ σ R(-1,1), ±1 jumps, p=.5, mean=0, var = σ² t, std = σ √t";
            myProcessValueType = MyChosenVariate.RANDOM_WALK;
            representAsScalingLimit = false;
            myVariate_MinView = -sigmaMultipleForRange * sigma * Math.sqrt(n);
            myVariate_MaxView = sigmaMultipleForRange * sigma * Math.sqrt(n);
            myRandomJump = () => MyRndUtilities.RademacherVariate();
            myVariate = (sumOfJumps) => (sigma * sumOfJumps);

        } else if (check_RANDOM_WALK_NORM.checked) {
            myProcessValueDescription = 'RW ("normalized" sum of Rademacher = Σ σ R(-1,1) / √t, mean=0, var=σ² for all t';
            myProcessValueType = MyChosenVariate.RANDOM_WALK_NORM;
            representAsScalingLimit = false;
            myVariate_MinView = -sigmaMultipleForRange * sigma;
            myVariate_MaxView = sigmaMultipleForRange * sigma;
            myRandomJump = () => MyRndUtilities.RademacherVariate();
            myVariate = (sumOfJumps, t) => (sigma * sumOfJumps / Math.sqrt(t));

        } else if (check_RANDOM_WALK_RESCALED.checked) {
            myProcessValueDescription = 'rescaled sum, Σ R(-1,1) * sqrt(dt), where dt=1/n, mean=0, var=1 at last time n, taken as 1 (scaling limit)';
            myProcessValueType = MyChosenVariate.RANDOM_WALK_RESCALED;
            representAsScalingLimit = true;
            myVariate_MinView = -sigmaMultipleForRange;
            myVariate_MaxView = sigmaMultipleForRange;
            myRandomJump = () => MyRndUtilities.RademacherVariate() * sqrt_dt;
            myVariate = (sumOfJumps) => sumOfJumps;

        } else if (check_BROWNIAN_MOTION_STANDARD.checked) {
            myProcessValueDescription = 'Standard BM ≈ Σ N(0, dt), where dt=1/n, mean=0, var=1 at last time n, taken as 1';
            myProcessValueType = MyChosenVariate.BROWNIAN_MOTION_STANDARD;
            representAsScalingLimit = true;
            myVariate_MinView = -sigmaMultipleForRange;
            myVariate_MaxView = sigmaMultipleForRange;
            myRandomJump = () => MyRndUtilities.gaussian(0, sqrt_dt);
            myVariate = (sumOfJumps) => sumOfJumps;

        } else if (check_BROWNIAN_MOTION_GEN.checked) {
            myProcessValueDescription = "general (arithmetic) Brownian motion ≈ Σ N(μ dt, σ² dt), where dt=1/n, mean=μ, var=σ² at last time n, taken as 1";
            myProcessValueType = MyChosenVariate.BROWNIAN_MOTION_GENERAL;
            representAsScalingLimit = true;
            myVariate_MinView = Math.min(0, mu - sigmaMultipleForRange * sigma);
            myVariate_MaxView = Math.max(0, mu + sigmaMultipleForRange * sigma);
            myRandomJump = () => MyRndUtilities.gaussian(mu * dt, sigma_sqrt_dt);
            myVariate = (sumOfJumps) => sumOfJumps;

        } else if (check_POISSON.checked) {
            myProcessValueDescription = "Poisson with rate λ ( ≈ Σ Be(λ/n), mean=λ, var=λ )";
            myProcessValueType = MyChosenVariate.POISSON;
            representAsScalingLimit = false;
            myVariate_MinView = 0;
            myVariate_MaxView = lambda * 1.5;
            myRandomJump = () => MyRndUtilities.bernoulliVariate(lambda / n);
            myVariate = (sumOfJumps) => (sumOfJumps);
        }

        myProcessValue_Range = myVariate_MaxView - myVariate_MinView;
        intervalSize = myProcessValue_Range / NumberOfClasses;

        [x_Origin, y_Origin] = My2dUtilities.transformXYToViewport([0, 0], 0, n, myVariate_MinView, myProcessValue_Range, rectChart);

    }

    function mainTask() {

        clearInterval(MyTimer);
        acquisizioneScelteUtente();     //acquisizione nuove scelte
        intervals_t = [];               //intervalli per distribuzione tempo intermedio
        intervals_n = [];               //intervalli per distribuzione tempo finale
        currentPathNumber = 0;
        avgAtLastTime = 0;              //media della variata al tempo n
        ssAtLastTime = 0;               //somma quadrati della variata al tempo n
        ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
        allPaths = [];


        if (representAsAnimation) {
            MyTimer = setInterval(performAnimationForEachpath, 10);
        } else {

            //generazione sample paths
            for (let s = 1; s <= numberOfSamplePaths; s++) {
                const newPath = createSinglePath(s);
                allPaths.push(newPath);
                ctx.lineWidth = 1;
                ctx.strokeStyle = MyChartUtilities.randomColorCSS();      //MyChartUtilities.randomColor();
                ctx.stroke(newPath);
            }

            sovrapponiIstogrammi();
            creaTaccheELegenda();
        }

    }

    function redrawAll(AllgrayOneRed) {

        ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);

        for (const p of allPaths) {
            ctx.lineWidth = 1;
            if (AllgrayOneRed) {
                ctx.strokeStyle = MyChartUtilities.randomRgbaString(0.2);
            } else {
                ctx.strokeStyle = MyChartUtilities.randomColorCSS();
            }
            ctx.stroke(p);
        }
        if (AllgrayOneRed) {
            ctx.lineWidth = 2;
            ctx.strokeStyle = "red";
            ctx.stroke(allPaths[allPaths.length - 1]);
        }

        sovrapponiIstogrammi();
        creaTaccheELegenda();

    }

    function performAnimationForEachpath() {

        const newPath = createSinglePath(allPaths.length + 1);
        allPaths.push(newPath);
        redrawAll(true);

        if (allPaths.length >= numberOfSamplePaths) {
            clearInterval(MyTimer);
            redrawAll(false);
        }
    }

    function sovrapponiIstogrammi() {

        //rettangolo contenitore istogramma
        const rettangoloIstogramma_t = new Rettangolo(My2dUtilities.transformX(timeForHistogram_t, 0, n, rectChart.x, rectChart.width), rectChart.y, 150, rectChart.height);
        const rettangoloIstogramma_n = new Rettangolo(My2dUtilities.transformX(timeForHistogram_n, 0, n, rectChart.x, rectChart.width), rectChart.y, 150, rectChart.height);
        rettangoloIstogramma_t.disegnaRettangolo(ctx, "rgba(100,100,250,0.5)", 2, [1, 1]);
        rettangoloIstogramma_n.disegnaRettangolo(ctx, "rgba(250,100,150,0.5)", 2, [1, 1]);

        //istogrammi
        MyChartUtilities.verticalHistoFromIntervals(ctx, intervals_t, myVariate_MinView, myVariate_MaxView - myVariate_MinView, rettangoloIstogramma_t, "red", 1, "yellow");
        MyChartUtilities.verticalHistoFromIntervals(ctx, intervals_n, myVariate_MinView, myVariate_MaxView - myVariate_MinView, rettangoloIstogramma_n, "red", 1, "yellow");

    }

    function createSinglePath(s) {

        currentPathNumber = s;
        const myPath = new Path2D();

        let sumOfJumps = 0;
        let previousY_Variate = y_Origin;

        myPath.moveTo(x_Origin, y_Origin);   //visualmente facciamo partire la path dall'origine

        for (let t = 1; t <= n; t++) {

            sumOfJumps += myRandomJump();
            let myProcessValue = myVariate(sumOfJumps, t);

            //raccolta valori per istogramma
            if (t === timeForHistogram_t) {
                MyDistributionUtilities.allocateValueInIntervals(myProcessValue, intervals_t, intervalSize);
            } else if (t === timeForHistogram_n) {
                MyDistributionUtilities.allocateValueInIntervals(myProcessValue, intervals_n, intervalSize);
                [avgAtLastTime, ssAtLastTime] = MyDistributionUtilities.UpdateMeanAndSS(myProcessValue, s, [avgAtLastTime, ssAtLastTime]);
            }

            const ascissa_t = My2dUtilities.transformX(t / n, 0, 1, rectChart.x, rectChart.width);

            //const ascissa_t = My2dUtilities.transformX(t, 0, n, rectChart.x, rectChart.width);
            const ordinata = My2dUtilities.transformY(myProcessValue, myVariate_MinView, myProcessValue_Range, rectChart.y, rectChart.height);

            //scalino mantenendo quota precedente
            myPath.lineTo(ascissa_t, previousY_Variate);
            //salva quota per prossimo scalino
            previousY_Variate = ordinata;

            myPath.lineTo(ascissa_t, ordinata);
        }

        return myPath;

    }

    function creaTaccheELegenda() {

        //rettangolo simulazione
        rectChart.disegnaRettangolo(ctx, "darkblue", 2, []);

        //label riferimenti numerici range, media, sigma della variata
        ctx.font = "11px Verdana";
        ctx.fillStyle = "white";
        ctx.fillText(myVariate_MaxView.toFixed(1), rectChart.right() + 10, rectChart.y - 7);
        ctx.fillText(myVariate_MinView.toFixed(1), rectChart.right() + 10, rectChart.bottom() - 7);
        ctx.fillStyle = "lightblue";
        ctx.fillText("paths: " + currentPathNumber + "  avg = " + avgAtLastTime.toFixed(2) + "  var = " + (ssAtLastTime / numberOfSamplePaths).toFixed(2), rectChart.x + 350, rectChart.bottom() + 30);
        ctx.fillStyle = "white";
        ctx.fillText(myProcessValueDescription, rectChart.x + 100, rectChart.y + 15);

        //tacche tempi/trials e tempi

        ctx.beginPath();

        if (representAsScalingLimit) {      //scaling limit: 0 -- 1
            ctx.fillStyle = "orange";
            ctx.strokeStyle = "orange";
            for (let t = 0; t <= 1; t += 0.1) {
                let ascissa_t = My2dUtilities.transformX(t, 0, 1, rectChart.x, rectChart.width);
                ctx.moveTo(ascissa_t, rectChart.bottom() - 3);
                ctx.lineTo(ascissa_t, rectChart.bottom() + 3);
                ctx.fillText(t.toFixed(1).toString(), ascissa_t - 5, rectChart.bottom() + 15);
            }

        } else {

            ctx.fillStyle = "white";
            ctx.strokeStyle = "white";
            const step = 10 ** Math.round(Math.log10(n) - 1);
            for (let t = 0; t <= n; t += step) {
                let ascissa_t = My2dUtilities.transformX(t, 0, n, rectChart.x, rectChart.width);
                ctx.moveTo(ascissa_t, rectChart.bottom() - 3);
                ctx.lineTo(ascissa_t, rectChart.bottom() + 3);
                ctx.fillText(t.toFixed(1).toString(), ascissa_t - 5, rectChart.bottom() + 15);
            }
        }
        ctx.stroke();

    }