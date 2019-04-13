"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Infos = /** @class */ (function () {
    function Infos(life, shield, dead, weapon, ammo, speed, hasEnemyFlag, team) {
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
    }
    Infos.prototype.apply = function (infos) {
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
    };
    return Infos;
}());
exports.default = Infos;
