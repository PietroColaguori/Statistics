// The request is as follows:
/*  QUESTION 1
    M systems are subject to a series of N attacks. On the x-axis, we indicate the attacks and on the Y-axis we
    simulate the accumulation of a "security score" (-1, 1), where the score is -1 if the system is penetrated
    and 1 if the system was successfully "shielded" or protected. Simulate the score "trajectories" for all systems,
    assuming, for simplicity, a constant penetration probability p at each attack.
*/

function runSimulation(M, N, p) {
    function simulateSystems(M, N, p) {
        const systems = [];
        for (let i = 0; i < M; i++) {
            const scores = [];
            let score = 0;
            for (let j = 0; j < N; j++) {
                const random = Math.random();
                if (random <= p) {
                    score = -1; // System is penetrated
                } else {
                    score = 1; // System is protected
                }
                scores.push(score);
            }
            systems.push(scores);

        }
        return systems;
    }

    // Some example values
    const numberOfSystems = 5;
    const numberOfAttacks = 10;
    const penetrationProbability = 0.3;
    
    const simulatedSystems = simulateSystems(numberOfSystems, numberOfAttacks, penetrationProbability);
    
    // Output the results
    simulatedSystems.forEach((system, index) => {
        document.getElementById("results_q1").innerHTML += `System ${index + 1}: ${system.join(', ')}`;
    });
}



