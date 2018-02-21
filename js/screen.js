function initScreenBuffers(gl) {
    var screenBuffers = {};

    // Screen vertex positions
    screenBuffers.pos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, screenBuffers.pos);
    var xyz = [
        -3,-3,0, -3,3,0, 3,-3,0,
        3,-3,0, 3,3,0, -3,3,0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(xyz), gl.STATIC_DRAW);
    screenBuffers.pos.itemSize = 3;
    screenBuffers.pos.numItems = 6;

    //  Screen colors
    screenBuffers.col = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, screenBuffers.col);
    var rgb = [
        1,1,1, 1,1,1, 1,1,1,     1,1,1, 1,1,1, 1,1,1,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rgb), gl.STATIC_DRAW);
    screenBuffers.col.itemSize = 3;
    screenBuffers.col.numItems = 6;

    // Screen textures
    screenBuffers.tex = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, screenBuffers.tex);
    var tex = [
        0,0, 0,1, 1,0,
        1,0, 1,1, 0,1
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tex), gl.STATIC_DRAW);
    screenBuffers.tex.itemSize = 2;
    screenBuffers.tex.numItems = 6;

    // Screen normals
    screenBuffers.norm = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, screenBuffers.norm);
    var normals = [
        0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    screenBuffers.norm.itemSize = 3;
    screenBuffers.norm.numItems = 6;

    return screenBuffers;
}