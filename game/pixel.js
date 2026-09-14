/* Original code-drawn scenery and temporary characters inspired by sample/.
   No sample screenshot is used as a background or cropped into a sprite. */
(function(root){
  'use strict';
  const glyphs={
    A:['01110','10001','10001','11111','10001','10001','10001'],B:['11110','10001','10001','11110','10001','10001','11110'],C:['01111','10000','10000','10000','10000','10000','01111'],D:['11110','10001','10001','10001','10001','10001','11110'],E:['11111','10000','10000','11110','10000','10000','11111'],F:['11111','10000','10000','11110','10000','10000','10000'],G:['01111','10000','10000','10111','10001','10001','01111'],H:['10001','10001','10001','11111','10001','10001','10001'],I:['111','010','010','010','010','010','111'],J:['00111','00010','00010','00010','10010','10010','01100'],K:['10001','10010','10100','11000','10100','10010','10001'],L:['10000','10000','10000','10000','10000','10000','11111'],M:['10001','11011','10101','10101','10001','10001','10001'],N:['10001','11001','10101','10011','10001','10001','10001'],O:['01110','10001','10001','10001','10001','10001','01110'],P:['11110','10001','10001','11110','10000','10000','10000'],Q:['01110','10001','10001','10001','10101','10010','01101'],R:['11110','10001','10001','11110','10100','10010','10001'],S:['01111','10000','10000','01110','00001','00001','11110'],T:['11111','00100','00100','00100','00100','00100','00100'],U:['10001','10001','10001','10001','10001','10001','01110'],V:['10001','10001','10001','10001','10001','01010','00100'],W:['10001','10001','10001','10101','10101','11011','10001'],X:['10001','10001','01010','00100','01010','10001','10001'],Y:['10001','10001','01010','00100','00100','00100','00100'],Z:['11111','00001','00010','00100','01000','10000','11111'],
    '0':['01110','10001','10011','10101','11001','10001','01110'],'1':['010','110','010','010','010','010','111'],'2':['01110','10001','00001','00010','00100','01000','11111'],'3':['11110','00001','00001','01110','00001','00001','11110'],'4':['00010','00110','01010','10010','11111','00010','00010'],'5':['11111','10000','10000','11110','00001','00001','11110'],'6':['01110','10000','10000','11110','10001','10001','01110'],'7':['11111','00001','00010','00100','01000','01000','01000'],'8':['01110','10001','10001','01110','10001','10001','01110'],'9':['01110','10001','10001','01111','00001','00001','01110'],
    '♥':['01010','11111','11111','11111','01110','00100','00000'],'-':['000','000','000','111','000','000','000'],'.':['0','0','0','0','0','1','1'],'!':['1','1','1','1','1','0','1'],'/':['00001','00001','00010','00100','01000','10000','10000'],'×':['00000','00000','10001','01010','00100','01010','10001'],' ':['000','000','000','000','000','000','000']
  };
  glyphs['?']=['01110','10001','00001','00010','00100','00000','00100'];
  glyphs['+']=['00000','00100','00100','11111','00100','00100','00000'];
  function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
  function text(c,str,x,y,color='#fff6df',scale=1,center=false){
    str=str.toUpperCase(); const width=[...str].reduce((n,ch)=>n+((glyphs[ch]||glyphs[' '])[0].length+1)*scale,0)-scale;
    let cursor=Math.round(center?x-width/2:x);
    for(const ch of str){const g=glyphs[ch]||glyphs[' '];g.forEach((row,j)=>[...row].forEach((v,i)=>{if(v==='1')rect(c,cursor+i*scale,y+j*scale,scale,scale,color);}));cursor+=(g[0].length+1)*scale;}
  }
  function heart(c,x,y,s=1,color='#eb648b'){text(c,'♥',x,y,color,s,true);}
  function cloud(c,x,y,s=1,dark=false){
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(s,s);
    const shade=dark?'#344d70':'#acd1f0',main=dark?'#425f82':'#eef5f6',light=dark?'#536f90':'#fff9ed';
    rect(c,0,10,50,9,shade);rect(c,6,4,36,12,main);rect(c,15,-2,15,14,main);rect(c,18,-4,9,9,light);rect(c,4,8,13,6,light);rect(c,34,6,10,7,light);c.restore();
  }
  function hill(c,x,y,w,h,color){for(let i=0;i<w;i+=6){const height=Math.sin(i/w*Math.PI)*h;rect(c,x+i,y-height,6,height+50,color);}}
  function tree(c,x,y,s=1,dark=0){
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(s,s);
    rect(c,-5,-38,10,38,'#72462f');rect(c,-2,-36,4,34,'#ad743b');rect(c,-13,-35,9,5,'#8c572f');rect(c,4,-46,9,5,'#8c572f');
    const outline=dark>.5?'#173f3e':'#1d643a',shade=dark>.5?'#245939':'#358440',main=dark>.5?'#477137':'#68ad36',light=dark>.5?'#66833e':'#95c94a';
    rect(c,-25,-66,47,23,outline);rect(c,-19,-79,33,50,outline);rect(c,-30,-58,56,17,outline);
    rect(c,-23,-64,44,19,shade);rect(c,-16,-76,29,45,shade);rect(c,-25,-54,48,13,shade);
    rect(c,-16,-70,28,19,main);rect(c,-22,-56,23,13,main);rect(c,0,-57,18,18,main);rect(c,-10,-75,18,9,main);
    for(let i=0;i<9;i++)rect(c,-14+(i*13%32),-69+(i*11%31),3,3,light);
    c.restore();
  }
  function flower(c,x,y,pink=false){rect(c,x,y-6,1,7,'#438b4a');rect(c,x-3,y-3,3,2,'#74ac45');rect(c,x-3,y-8,7,3,pink?'#f8bfd1':'#fffcec');rect(c,x-1,y-10,3,7,pink?'#f8bfd1':'#fffcec');rect(c,x-1,y-8,3,3,'#efc452');}
  function coin(c,x,y,t){const w=Math.abs(Math.sin(t*4))<.2?3:8;rect(c,x-w/2-1,y-7,w+2,14,'#292d24');rect(c,x-w/2,y-8,w,16,'#785125');rect(c,x-w/2,y-6,w,12,'#ffd34e');rect(c,x-w/2+1,y-5,2,10,'#fff1a0');if(w>3)rect(c,x+2,y-5,1,10,'#d2942d');}
  function sign(c,x,y,label){rect(c,x-2,y-12,5,12,'#87572f');rect(c,x-24,y-35,48,24,'#382e26');rect(c,x-22,y-33,44,20,'#a77340');rect(c,x-19,y-31,39,3,'#c28d50');text(c,label,x,y-25,'#fff4dd',1,true);}
  function castle(c,x,base,s=1){
    c.save();c.translate(Math.round(x),Math.round(base));c.scale(s,s);
    const tower=(tx,ty,w,h)=>{rect(c,tx,ty,w,h,'#e8c8bd');rect(c,tx+3,ty,w-6,h,'#fff0d3');rect(c,tx,ty,w,4,'#ffe7ba');for(let k=0;k<w/2;k+=3)rect(c,tx+k,ty-3-k,w-k*2,4,'#cd6682');rect(c,tx+w/2,ty-w/2-12,1,12,'#eed9b6');rect(c,tx+w/2+1,ty-w/2-12,9,5,'#f5a2b0');rect(c,tx+w/2-2,ty+9,5,10,'#94889b');};
    tower(-50,-43,20,43);tower(30,-43,20,43);tower(-18,-91,36,91);tower(-35,-62,15,62);tower(20,-62,15,62);
    rect(c,-30,-36,60,36,'#f8dec8');rect(c,-25,-33,50,33,'#fff1d6');heart(c,0,-56,3,'#d96987');
    rect(c,-10,-23,20,23,'#cf8e73');rect(c,-7,-25,14,25,'#eab27f');rect(c,-5,-19,10,19,'#ffe0a0');
    rect(c,-27,0,54,4,'#d5b6b7');rect(c,-33,4,66,4,'#e7ccbe');rect(c,-39,8,78,4,'#d5b6b7');rect(c,-9,0,18,12,'#ca6380');
    for(let i=0;i<11;i++){const a=i/10*Math.PI;const fx=Math.cos(a)*26,fy=-Math.sin(a)*30-3;rect(c,fx-3,fy-2,6,5,'#608652');flower(c,fx,fy+2,i%2===0);}
    c.restore();
  }
  // Temporary sprites. Replace with assets/groom.png and assets/bride.png.
  // Oversized dark hair, black tuxedo, ivory dress, brown hair and floral veil.
  function groom(c,x,y,t=0,running=true,face=1){
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(face,1);
    const step=running?Math.floor(t*10)%2:0,bob=running?step:0;
    c.translate(0,-bob);
    rect(c,-8,-12,7,10,'#171c20');rect(c,2,-12,7,10,'#171c20');
    rect(c,-10-step*2,-3,9,3,'#10161a');rect(c,3+step*2,-3,9,3,'#10161a');
    rect(c,-9,-25,19,16,'#11191b');rect(c,-7,-24,6,14,'#303739');rect(c,2,-23,6,13,'#252c2e');
    rect(c,-2,-25,7,10,'#faf8ed');rect(c,0,-21,3,5,'#fff');rect(c,-2,-24,3,2,'#10181c');rect(c,3,-24,3,2,'#10181c');
    rect(c,-13,-21+step*3,6,12,'#161e20');rect(c,-13,-11+step*3,5,4,'#ffd0a0');rect(c,9,-21-step*2,5,9,'#24292b');rect(c,11,-17-step*2,5,5,'#f6bf8e');
    rect(c,-8,-39,18,13,'#bd805a');rect(c,-6,-38,17,12,'#ffd1a2');rect(c,10,-33,3,5,'#ffd1a2');rect(c,6,-35,2,5,'#182120');rect(c,5,-36,2,1,'#fff5df');
    rect(c,-12,-40,23,10,'#101717');rect(c,-9,-44,17,5,'#101717');rect(c,-5,-46,10,3,'#101717');rect(c,-10,-35,8,5,'#101717');rect(c,-6,-31,3,4,'#f0b68a');
    rect(c,-8,-41,5,3,'#252725');rect(c,1,-42,5,2,'#292b28');rect(c,6,-39,6,3,'#222521');rect(c,-1,-36,3,6,'#101717');rect(c,4,-36,2,3,'#101717');
    c.restore();
  }
  function bride(c,x,y,t=0){
    c.save();c.translate(Math.round(x),Math.round(y));
    rect(c,-6,-41,19,25,'#53372a');rect(c,-9,-37,22,21,'#442e28');
    rect(c,9,-36,6,31,'#ece1ed');rect(c,14,-27,5,25,'#fff4f0');rect(c,18,-17,4,16,'#fff4f0');
    rect(c,-7,-35,14,12,'#ffd1a7');rect(c,-10,-31,4,5,'#ffd1a7');rect(c,-6,-33,2,5,'#29231f');
    rect(c,-8,-38,14,4,'#523728');rect(c,0,-36,5,5,'#57372b');rect(c,6,-35,5,20,'#55392e');rect(c,8,-30,2,11,'#6c4631');
    rect(c,-5,-22,11,9,'#fffbef');rect(c,-7,-16,15,8,'#fff8ee');rect(c,-11,-10,24,7,'#f5e6ec');rect(c,-15,-4,33,4,'#fffcf4');
    rect(c,-5,-12,4,10,'#fffef9');rect(c,3,-11,3,9,'#ddcfdf');rect(c,11,-3,4,3,'#e8d6e4');
    rect(c,-10,-22,5,8,'#ffd1a7');rect(c,-14,-17,8,4,'#f5bf96');rect(c,-15,-14,2,9,'#427941');
    flower(c,-14,-13,true);flower(c,-9,-16,true);flower(c,-18,-17,false);
    flower(c,7,-34,false);flower(c,11,-30,true);rect(c,6,-40,2,3,'#93ab67');
    c.restore();
  }
  root.Pixel={rect,text,heart,cloud,hill,tree,flower,coin,sign,castle,groom,bride};
})(globalThis);
