function initSphereBuffers(gl) {
    var sphereBuffers = {};

    var latitudeBands = 30;
    var longitudeBands = 30;
    var radius = 2;

    var vertexPositionData = [];
    var normalData = [];
    var textureCoordData = [];
    var colorData = [];
    for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            var u = 1 - (longNumber / longitudeBands);
            var v = 1 - (latNumber / latitudeBands);

            normalData.push(x);
            normalData.push(y);
            normalData.push(z);
            textureCoordData.push(u);
            textureCoordData.push(v);
            vertexPositionData.push(radius * x);
            vertexPositionData.push(radius * y);
            vertexPositionData.push(radius * z);
            colorData.push(1);
            colorData.push(1);
            colorData.push(1);
        }
    }

    var indexData = [];
    for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
        for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
            var first = (latNumber * (longitudeBands + 1)) + longNumber;
            var second = first + longitudeBands + 1;
            indexData.push(first);
            indexData.push(second);
            indexData.push(first + 1);

            indexData.push(second);
            indexData.push(second + 1);
            indexData.push(first + 1);
        }
    }

    sphereBuffers.norm = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereBuffers.norm);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
    sphereBuffers.norm.itemSize = 3;
    sphereBuffers.norm.numItems = normalData.length / 3;

    sphereBuffers.tex = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereBuffers.tex);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
    sphereBuffers.tex.itemSize = 2;
    sphereBuffers.tex.numItems = textureCoordData.length / 2;

    sphereBuffers.pos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereBuffers.pos);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
    sphereBuffers.pos.itemSize = 3;
    sphereBuffers.pos.numItems = vertexPositionData.length / 3;

    sphereBuffers.col = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereBuffers.col);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);
    sphereBuffers.col.itemSize = 3;
    sphereBuffers.col.numItems = colorData.length / 3;

    sphereBuffers.indexData = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereBuffers.indexData);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
    sphereBuffers.indexData.itemSize = 1;
    sphereBuffers.indexData.numItems = indexData.length;

    return sphereBuffers;
}
