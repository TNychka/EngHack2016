/**
 * Created by Tyler on 2016-10-28.
 */

function Particle(size, gene) {
    this.size = size;
    this.gene = gene;
    this.score = 0
}

function Vector(length, x, y) {
    this.length = length;
    this.x = x;
    this.y = y;
}

var generation = [];
var geneome = [];
//if generatation is empty a random generation will be spawned
function spawnGeneration(size) {
    if (generation.isEmpty()) {
        for (i in size) {
            numberOfVectors = getRandomArbitrary(1, 10);
            gene = [];
            for (z in numberOfVectors) {
                gene.add(getRandomVector());
            }
            generation.add(new Particle(10, gene));
        }
    } else {
        geneBase = breed(generation);
        generation = [];
        for (i in size) {
            gene = mutateGene(geneBase);
            generation.add(new Particle(10, gene));
        }
    }
}

function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function getRandomVector() {
    time = getRandomArbitrary(1, 10);
    x = getRandomArbitrary(-10, 10);
    y = getRandomArbitrary(-10, 10);
    return new Vector(time, x, y)
}

function bound(min, max, value) {
    return max(min(value, max), min)
}

/**
 * Returns altered gene
 * @param geneBase vectorList to mutate
 * @param mutationRate percent of gene attributes to modify (should be relatively low)
 */
function mutateGene(geneBase, mutationRate) {
    newGene = [];
    for (oldVector in geneBase) {
        length = oldVector.length;
        x = oldVector.x;
        y = oldVector.y;
        if (Math.random() < mutationRate) {
            rand = Math.random();
            variance = 2;
            if (rand < .33) { // change duration
                length = bound(0, 10, getRandomArbitrary(length - variance, length + variance))
            } else if (rand < .66) { //change x direction
                x = getRandomArbitrary(x - variance, x + variance)
            } else if (rand < .97) { //change y direction
                y = getRandomArbitrary(y - variance, y + variance)
            } else if (rand < .98) { //add new random direction
                newGene.add(getRandomVector())
            } else { //remove random direction
                if (newGene.length > 0) {
                    newGene.remove(getRandomArbitrary(0, newGene.length - 1))
                }
            }
        }
        newGene.add(new Vector(length, x, y))
    }
}

function breed(generation) {
    alpha = null;
    beta = null;
    delta = null;

    //select most fertile particles
    for (particle in generation) {
        if (alpha == null) {
            alpha = particle
        } else if (beta == null) {
            alpha = particle
        } else if (delta == null) {
            alpha = particle
        }

        if (particle.score > alpha.score) {
            alpha = particle
        } else if (particle.score > beta.score) {
            beta = particle
        } else if (particle.score > delta.score) {
            delta = particle
        }
    }
    newGene = [];
    for (i = 0; i < min(alpha.gene.length, beta.gene.length, delta.gene.length); i++) {
        newLength = (alpha.gene.length + beta.gene.length + delta.gene.length) / 3;
        newX = (alpha.gene.x + beta.gene.x + delta.gene.x) / 3;
        newY = (alpha.gene.y + beta.gene.y + delta.gene.y) / 3;
        newGene.add(new Vector(newLength, newX, newY))
    }
}

function kill(particle) {
    particle.score = scoreParticle(particle)

}

function scoreParticle() {

}