module.exports = {
  content:`<ul><li><font size="4"><b>1-首先要下载几个npm包:</b></font></li></ul><pre type="Bash"><code>cnpm i gulp gulp<span class="hljs-attribute">-sass</span> gulp<span class="hljs-attribute">-rename</span> gulp<span class="hljs-attribute">-changed</span> gulp<span class="hljs-attribute">-watch</span> <span class="hljs-subst">--</span>save<span class="hljs-attribute">-dev</span></code></pre><ul><li><font size="4"><b>2-然后再编辑gulpfile.js文件:</b></font></li></ul><div><pre type="Bash"><code><span class="hljs-reserved">var</span> gulp = <span class="hljs-built_in">require</span>(<span class="hljs-string">'gulp'</span>);
  <span class="hljs-reserved">var</span> sass = <span class="hljs-built_in">require</span>(<span class="hljs-string">'gulp-sass'</span>);
  <span class="hljs-reserved">var</span> rename = <span class="hljs-built_in">require</span>(<span class="hljs-string">'gulp-rename'</span>)
  <span class="hljs-reserved">var</span> changed = <span class="hljs-built_in">require</span>(<span class="hljs-string">'gulp-changed'</span>)
  <span class="hljs-reserved">var</span> watcher = <span class="hljs-built_in">require</span>(<span class="hljs-string">'gulp-watch'</span>)
  
  <span class="hljs-regexp">//</span>自动监听
  gulp.task(<span class="hljs-string">'default'</span>, gulp.series(<span class="hljs-reserved">function</span> () {
      watcher(<span class="hljs-string">'./pages/**/*.scss'</span>, <span class="hljs-reserved">function</span> () {
          miniSass();
      });
  }));
  
  <span class="hljs-regexp">//</span>手动编译
  gulp.task(<span class="hljs-string">'sass'</span>, <span class="hljs-reserved">function</span> () {
      miniSass();
  });
  
  
  <span class="hljs-reserved">function</span> miniSass() {
      <span class="hljs-keyword">return</span> gulp.src(<span class="hljs-string">'./pages/**/*.scss'</span>)<span class="hljs-regexp">//</span>需要编译的文件
          .pipe(sass({
              <span class="hljs-attribute">outputStyle</span>: <span class="hljs-string">'expanded'</span><span class="hljs-regexp">//</span>展开输出方式 expanded 
          }))
          .pipe<span class="hljs-function"><span class="hljs-params">(rename((path) =&gt; {
              path.extname = <span class="hljs-string">'.wxss'</span>
          }))</span>
          .<span class="hljs-title">pipe</span><span class="hljs-params">(changed(<span class="hljs-string">'./pages'</span>))</span>//只编译改动的文件
          .<span class="hljs-title">pipe</span><span class="hljs-params">(gulp.dest(<span class="hljs-string">'./pages'</span>))</span>//编译
          .<span class="hljs-title">pipe</span><span class="hljs-params">(rename((path) =&gt; {
              <span class="hljs-built_in">console</span>.log(<span class="hljs-string">'编译完成文件：'</span> + <span class="hljs-string">'pages\'</span> + path.dirname + <span class="hljs-string">'\'</span> + path.basename + <span class="hljs-string">'.scss'</span>)
          }))</span>
  }
  </span></code></pre></div><p><br></p><div></div><ul><li><font size="4"><b>3-最后执行gulp命令:</b></font></li></ul><div><img src="http://example.kkslide.fun/upload_577df09987e15ba11437374cc2eb191f" style="max-width:100%;" width="50%"><br></div><div><br></div><div><font size="4">完美!! 成功搞定将scss编译为wxss!! 可以愉快的写样式了</font></div><div><br></div><div><br></div>`,
  content2:`<p><span class="ql-size-large">1- 打开控制台</span></p><p><br></p><p><span class="ql-size-large">2- 打开输入命令窗口- Ctrl+Shift+P</span></p><p><span class="ql-size-large">		输入命令: capture...</span></p><p><span class="ql-size-large">		然后就会出现:</span></p><p><span class="ql-size-large">		<img src="http://example.kkslide.fun/upload_e4d2356e1a5c2ac4f9d0ff93d91541fb"></span></p><p><span class="ql-size-large">		</span></p><p>			<span class="ql-size-large">接着, 保存就可以了</span></p><p><br></p><p><span class="ql-size-large">超级容易!!!!</span></p><p><br></p>`,
  content3:`
  <p><br></p><p><br></p><p>aaaaaaa</p><hr><p>bbbbbbb</p><p><br></p><p style="text-align: center; "><iframe src="//player.bilibili.com/player.html?aid=500648158&amp;bvid=BV1wK411G7Bt&amp;cid=266165347&amp;page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe></p>
  `
}