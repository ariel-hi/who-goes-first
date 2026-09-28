import {test,expect} from '@playwright/test';
const canonicalOrigin = process.env.EXPECTED_SITE_ORIGIN ?? process.env.SITE_URL ?? 'http://localhost:4321';

for (const width of [320,1280]) {
  for (const [id,name] of [['266083','L.A.M.A.'],['318195','Biss 20'],['153','Hornochsen! (Take 5!)'],['200','Entdecker (Goldsieber)'],['550','Barbarossa (Klaus Teuber)'],['71','Civilization (1980 game)'],['68','Successors (Avalon Hill)'],['551','Battle Cry (Richard Borg)']] as const) {
    test(`pending identity ${id} remains distinct and usable at ${width}px`,async ({page,request})=>{
      const expectedHead=process.env.WGF_CATALOG_EXPECTED_HEAD;
      const marker=async()=>{if(expectedHead){const response=await request.get(`/release.json?verify=${Date.now()}`);expect(response.status()).toBe(200);expect(await response.json()).toEqual({commit:expectedHead});}};
      await marker();
      const pageErrors:string[]=[];page.on('pageerror',error=>pageErrors.push(error.message));
      await page.setViewportSize({width,height:844});
      await page.goto('/board-games/');
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',`${canonicalOrigin}/board-games/`);
      await page.getByRole('searchbox',{name:'Search board games'}).fill(id);
      await expect(page.locator('[data-results] li').first()).toHaveAttribute('data-id',id);
      await page.getByRole('button',{name:'Awaiting a rule',exact:true}).click();
      const row=page.locator(`[data-results] li[data-id="${id}"]`);
      await expect(row).toHaveCount(1);
      await expect(row).toHaveAttribute('data-has-rule','false');
      await expect(row.locator('summary')).toContainText(name);
      await expect(row).toContainText('No checked starting rule yet');
      await row.locator('summary').focus();await page.keyboard.press('Enter');
      await expect(row.getByRole('link',{name:'Pick a player',exact:true})).toBeVisible();
      await expect(row.getByRole('link',{name:'Pick a player',exact:true})).toHaveAttribute('href','/');
      await expect(row.getByRole('link',{name:/View game on BoardGameGeek/})).toHaveAttribute('href',`https://boardgamegeek.com/boardgame/${id}`);
      await expect(row.locator('a[href^="/games/"]')).toHaveCount(0);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      await page.getByRole('button',{name:'With a rule',exact:true}).click();
      await expect(row).toHaveCount(0);
      expect(pageErrors).toEqual([]);await marker();
    });
  }
}
