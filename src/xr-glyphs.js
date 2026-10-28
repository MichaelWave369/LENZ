// Small self-contained 5x7 bitmap font for the in-headset Case 001 reveal.
// Mesh vertices are emitted once, then rendered in a single WebGL draw per eye.
const FONT={
 'A':['01110','10001','10001','11111','10001','10001','10001'],
 'B':['11110','10001','10001','11110','10001','10001','11110'],
 'C':['01111','10000','10000','10000','10000','10000','01111'],
 'D':['11110','10001','10001','10001','10001','10001','11110'],
 'E':['11111','10000','10000','11110','10000','10000','11111'],
 'H':['10001','10001','10001','11111','10001','10001','10001'],
 'I':['11111','00100','00100','00100','00100','00100','11111'],
 'J':['00111','00010','00010','00010','10010','10010','01100'],
 'O':['01110','10001','10001','10001','10001','10001','01110'],
 'P':['11110','10001','10001','11110','10000','10000','10000'],
 'R':['11110','10001','10001','11110','10100','10010','10001'],
 'S':['01111','10000','10000','01110','00001','00001','11110'],
 'T':['11111','00100','00100','00100','00100','00100','00100'],
 'U':['10001','10001','10001','10001','10001','10001','01110'],
 ' ':['00000','00000','00000','00000','00000','00000','00000']
};
export const REVEAL_LINES=['THE SUBJECT','IS THE','PRODUCT'];
export function geometryForMessage(lines=REVEAL_LINES,{
 centerX=0,topY=2.80,z=-4.89,pixel=.067,lineGap=.20
}={}){
 const vertices=[];
 for(let rowIndex=0;rowIndex<lines.length;rowIndex++){
  const line=lines[rowIndex].toUpperCase();
  for(const ch of line)if(!FONT[ch])throw Error('Unsupported XR glyph: '+ch);
  const width=(line.length*6-1)*pixel;
  const start=centerX-width/2,top=topY-rowIndex*(7*pixel+lineGap);
  for(let i=0;i<line.length;i++){
   const glyph=FONT[line[i]];
   for(let y=0;y<7;y++)for(let x=0;x<5;x++){
    if(glyph[y][x]!=='1')continue;
    const x0=start+(i*6+x)*pixel,x1=x0+pixel*.82;
    const y1=top-y*pixel,y0=y1-pixel*.82;
    vertices.push(x0,y0,z,x1,y0,z,x1,y1,z, x0,y0,z,x1,y1,z,x0,y1,z);
   }
  }
 }
 return new Float32Array(vertices);
}
