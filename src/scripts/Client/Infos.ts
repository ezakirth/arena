import Weapon from "../Pickups/Weapon";

export default class Infos {
    life: number;
    shield: number;
    dead: boolean;
    weapon: Weapon;
    ammo: number;
    speed: number;
    hasEnemyFlag: boolean;
    team: string;
    enemyTeam: string;
    respawnTime: number;
    spawned: boolean;

    score: {
        kills: number,
        deaths: number,
        captures: number,
        returns: number
    };

    constructor(life: number, shield: number, dead: boolean, weapon: Weapon, ammo: number, speed: number, hasEnemyFlag: boolean, team: string) {
        this.life = life;
        this.shield = shield;
        this.dead = dead;
        this.weapon = weapon;
        this.ammo = ammo;
        this.speed = speed;
        this.hasEnemyFlag = hasEnemyFlag;
        this.team = team;

        this.enemyTeam = (team == 'green' ? 'blue' : 'green');
        this.respawnTime = 0;
        this.spawned = true;
        this.score = {
            kills: 0,
            deaths: 0,
            captures: 0,
            returns: 0
        }
    }

    apply(infos: Infos) {
        this.life = infos.life;
        this.shield = infos.shield;
        this.dead = infos.dead;
        this.weapon = infos.weapon;
        this.ammo = infos.ammo;
        this.speed = infos.speed;
        this.hasEnemyFlag = infos.hasEnemyFlag;
        this.team = infos.team;
        this.enemyTeam = infos.enemyTeam;
        this.respawnTime = infos.respawnTime;
        this.score = infos.score;
    }
}
