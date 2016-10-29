/**
 * Created by Tyler on 2016-10-28.
 */

function Particle(size, gene) {
    this.size = size;
    this.gene = gene;
    this.score = 1000000000000;
    this.x = 0;
    this.y = 0;
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
            gene = mutateGene(geneBase, .2);
            activeGeneration.push(new Particle(10, gene));
        }
    }
    generation = []
}

function getRandomArbitrary(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function getRandomVector() {
    var time = getRandomArbitrary(1, 10);
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
            } else if (rand < .98) { //insert new random direction
                newGene.push(getRandomVector())
            } else { //remove random direction
                if (newGene.time > 0) {
                    newGene.pop()
                }
            }
        }
        newGene.push(new Vector(time, x, y))
    }
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

function kill(particle) {
    var index = activeGeneration.indexOf(particle);
    var part = activeGeneration.splice(index, 1);
    part.score =scoreParticle(particle);
    generation.push(part);
}

function Target() {
    this.x = 1000;
    this.y = 1000;
}
var target = new Target();
function scoreParticle(particle) {
    return Math.abs(particle.x - target.x) + Math.abs(particle.y - target.y)
}

function updateParticles() {
    while (1) {
        if (activeGeneration.length === 0) {
            spawnGeneration(10);
        }
        var timeInterval = 0;
        while (activeGeneration.length !== 0) {
            timeInterval++;
            for (var i = 0; i < activeGeneration.length; i++) {
                var particle = activeGeneration[i];
                updateParticlePosition(particle, timeInterval);
            }
        }
    }
}

screenBoundsX = 1000;
screenBoundsY = 1000;
function updateParticlePosition(particle, timeInterval) {
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
            kill(particle);
            q = 0;
        }
    }
    var newX = particle.x + vector.x;
    var newY = particle.y + vector.y;
    if (activeGeneration.indexOf(particle) === -1) {
        //doesn't exist don't do anything
    } else if (collision(particle, vector) || newX < screenBoundsX || newX > screenBoundsX || newY < screenBoundsY || newY > screenBoundsY) {
        kill(particle);
    } else {
        particle.x = newX;
        particle.y = newY;
        activeGeneration[index] = particle;
    }
}

function Line() {
    this.x1 = 100;
    this.y1 = 100;
    this.x2 = 200;
    this.y2 = 200;
}
line = new Line();
lines = [line];
function collision(particle, vector) {
    for (i = 0; i < lines.length; i++) {
        if (line_intersects(
                particle.x,
                particle.y,
                particle.x + vector.x,
                particle.y + vector.y,
                lines[i].x1,
                lines[i].y1,
                lines[i].x2,
                lines[i].y2)){
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

updateParticles();