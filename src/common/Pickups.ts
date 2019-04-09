export const Pickups: any = {
    buffs: {
        medkit: {
            type: 'buff',
            name: 'medkit',
            life: 30,
            shield: 0,
            speed: 0
        },
        shield: {
            type: 'buff',
            name: 'shield',
            life: 0,
            shield: 25,
            speed: 0
        },
        speed: {
            type: 'buff',
            name: 'speed',
            life: 0,
            shield: 0,
            speed: 0.05
        }
    },

    flags: {
        flag_blue: {
            type: 'flag',
            name: 'flag_blue'
        },
        flag_green: {
            type: 'flag',
            name: 'flag_green'
        }
    },

    weapons: {
        gun: {
            type: 'weapon',
            name: 'gun',
            sprite: 'bullet',
            dmg: 20,
            rate: 0.4,
            speed: 0.2,
            range: 500,
            ammo: 1 / 0,
            weight: 1.0
        },

        minigun: {
            type: 'weapon',
            name: 'minigun',
            sprite: 'bullet',
            dmg: 8,
            rate: 0.1,
            speed: 0.2,
            range: 800,
            ammo: 60,
            weight: 2.0
        },

        blastgun: {
            type: 'weapon',
            name: 'blastgun',
            sprite: 'blast',
            dmg: 15,
            rate: 0.2,
            speed: 0.2,
            range: 1000,
            ammo: 60,
            weight: 2.5
        },

        railgun: {
            type: 'weapon',
            name: 'railgun',
            sprite: 'blast3',
            dmg: 150,
            rate: 2,
            speed: 0.40,
            range: 1000,
            ammo: 5,
            weight: 3
        },

        shotgun: {
            type: 'weapon',
            name: 'shotgun',
            sprite: 'bullet',
            dmg: 10,
            rate: 1.5,
            speed: 0.2,
            range: 300,
            ammo: 15,
            weight: 1.5
        },

        rpg: {
            type: 'weapon',
            name: 'rpg',
            sprite: 'bullet',
            dmg: 100,
            rate: 1,
            speed: 0.10,
            range: 3000,
            ammo: 10,
            weight: 3
        }
    }
}
