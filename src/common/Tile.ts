export default class Tile {
    // contains the texture name (floor, etc.)
    tex: string;
    // true if not walkable, else false
    solid: boolean = true;
    // contains the pickup name (medkit, weapon, flags, etc.) (flag gathered on map load)
    pickup: string;
    // contains a list of decal texture names
    decals: Array<string> = [];
    // contains shadow texture name
    shadow: string;
    // contains spawn texture (gathered on map load)
    spawn: string;
    // contains portal information (color and destination)
    portal: any;
    // contains dropped flag texture, only used during game
    flag: string;
}
