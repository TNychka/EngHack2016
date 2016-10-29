/**
 * Created by Tyler on 2016-10-28.
 */

function Particle(size, gene) {
    this.size = size;
    this.gene = gene;
    this.score = 0;
    this.x = 10;
    this.y = 10;
}

function Vector(time, x, y) {
    this.time = time;
    this.x = x;
    this.y = y;
}

var generation = [];
var activeGeneration = [];
//if generatation is empty a random generation will be spawned
function spawnGeneration(size) {
    if (generation.length === 0) {
        for (var i = 0; i < size; i++) {
            var numberOfVectors = getRandomArbitrary(1, 10);
            var gene = [];
            for (var z = 0; z < numberOfVectors; z++) {
                gene.push(getRandomVector());
            }
            activeGeneration.push(new Particle(10, gene));
        }
    } else {
        var geneBase = breed(generation);
        activeGeneration = [];
        for (i = 0; i < size; i++) {
            gene = mutateGene(geneBase, 0.5);
            activeGeneration.push(new Particle(10, gene));
        }
    }
    generation = []
}

function getRandomArbitrary(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function getRandomVector() {
    var time = getRandomArbitrary(1, 100);
    var x = getRandomArbitrary(-10, 10);
    var y = getRandomArbitrary(-10, 10);
    return new Vector(time, x, y)
}

function bound(min, max, value) {
    return Math.max(Math.min(value, max), min)
}

/**
 * Returns altered gene
 * @param geneBase vectorList to mutate
 * @param mutationRate percent of gene attributes to modify (should be relatively low) (0.01)
 */
function mutateGene(geneBase, mutationRate) {
    var newGene = [];
    for (var i = 0; i < geneBase.length; i++) {
        var oldVector = geneBase[i];
        var time = oldVector.time;
        var x = oldVector.x;
        var y = oldVector.y;
        if (Math.random() < mutationRate) {
            var rand = Math.random();
            var variance = 2;
            if (rand < .33) { // change duration
                time = bound(0, 10, getRandomArbitrary(time - variance, time + variance))
            } else if (rand < .66) { //change x direction
                x = getRandomArbitrary(x - variance, x + variance)
            } else if (rand < .97) { //change y direction
                y = getRandomArbitrary(y - variance, y + variance)
            } else if (rand < 1) { //insert new random direction
                newGene.push(getRandomVector())
            } else { //remove random direction
                if (newGene.length > 0) {
                    newGene.pop()
                }
            }
        }
        newGene.push(new Vector(time, x, y))
    }
    if(newGene.length === 0) {
        var numberOfVectors = getRandomArbitrary(1, 10);
        for (var z = 0; z < numberOfVectors; z++) {
            newGene.push(getRandomVector());
        }
    }
    return newGene
}

//can enable extra breeding particle if desired. Just uncomment the not comments
function breed(generation) {
    var alpha = null;
    var beta = null;
    //var delta = null; //unused for now

    //select most fertile particles
    for (i = 0; i < generation.length; i++) {
        var particle = generation[i];
        if (alpha == null) {
            alpha = particle
        } else if (beta == null) {
            beta = particle
        }/**else if (delta == null) {
            delta = particle
        }*/

        else if (particle.score > alpha.score) {
            alpha = particle
        } else if (particle.score > beta.score) {
            beta = particle
        }
        /** else if (particle.score > delta.score) {
            delta = particle
        }*/
    }

    var newGene = [];
    //breed particles (take random vector attribute of the vectors attributes)
    for (var i = 0; i < Math.max(alpha.gene.length, beta.gene.length/**, delta.gene.length*/); i++) {
        var crossover = getRandomArbitrary(1, 2); //getRandomArbitrary(1, 3);
        switch (crossover) { //select random vector from breeding pool until
            case 1:
                if (alpha.gene.length > i) {
                    newGene.push(alpha.gene[i]);
                }
                break;
            case 2:
                if (beta.gene.length > i) {
                    newGene.push(beta.gene[i]);
                }
                break;
            /**case 3:
             if(delta.gene.length > i) {
                    newGene.push(delta.gene(i));
                    break;
                }*/
            default://select random vector again
                i--;
        }
    }
    return newGene;
}

function kill(particle, timeIndex) {
    var index = activeGeneration.indexOf(particle);
    activeGeneration.splice(index, 1);
    particle.score = scoreParticle(particle, timeIndex);
    generation.push(particle);
}

function Target() {
    this.x = 1000;
    this.y = 500;
}
var target = new Target();
function scoreParticle(particle, timeIndex) {
    return (10000 - Math.abs(particle.x - target.x)) + (10000 - Math.abs(particle.y - target.y)) + (10000 - timeIndex)
}

var timeInterval = 0;
function updateParticles(lines) {
    if (activeGeneration.length === 0 || timeInterval > 300) {
        for (particle in activeGeneration) {
            kill(activeGeneration[particle])
        }
        spawnGeneration(100);
        timeInterval = 0;
    }
    timeInterval++;
    for (particle in activeGeneration) {
        var particle = activeGeneration[particle];
        updateParticlePosition(particle, timeInterval, lines, timeInterval);
    }
    return activeGeneration
}

var screenBoundsX = window.innerWidth;
var screenBoundsY = window.innerHeight;
function updateParticlePosition(particle, timeInterval, lines, timeIndex) {
    if (!particle) {
        return
    }
    var q = timeInterval;
    var index = 0;
    var vector = particle.gene[index];
    while (q > 0) {
        if (vector.time < q) {
            q -= vector.time;
            index++;
        } else {
            break;
        }
        if (index >= particle.gene.length) {
            kill(particle, timeIndex);
            break;
        } else {
            vector = particle.gene[index]
        }
    }
    var newX = particle.x + vector.x;
    var newY = particle.y + vector.y;
    if (activeGeneration.indexOf(particle) === -1) {
        //doesn't exist don't do anything
    } else if (collision(particle, vector, lines) || newX < 0 || newX > screenBoundsX || newY < 0 || newY > screenBoundsY) {
        kill(particle, timeIndex);
    } else {
        particle.x = newX;
        particle.y = newY;
        activeGeneration[index] = particle;
    }
}

function collision(particle, vector, lines) {
    for (i = 0; i < lines.length; i++) {
        if (line_intersects(
                particle.x,
                particle.y,
                particle.x + vector.x,
                particle.y + vector.y,
                lines[i].x1,
                lines[i].y1,
                lines[i].x2,
                lines[i].y2)) {
            return true;
        }
    }
    return false;
}

function line_intersects(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {

    var s1_x, s1_y, s2_x, s2_y;
    s1_x = p1_x - p0_x;
    s1_y = p1_y - p0_y;
    s2_x = p3_x - p2_x;
    s2_y = p3_y - p2_y;

    var s, t;
    s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
    t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

    return (s >= 0 && s <= 1 && t >= 0 && t <= 1)
}


function Line(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
}

var generationIndex = 0;
// while (1) {
//     generationIndex++;
//     var test = updateParticles([new Line(100, 100, 200, 200)]);
// }