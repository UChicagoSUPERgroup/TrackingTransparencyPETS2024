import React from 'react';
import {
  Route,
  Link
} from 'react-router-dom';

// import unicode from 'unicode-10.0.0';
import {getBlocks, getCharacters} from 'unidata10';

import helpers from './helpers';
import {CharactersGrid} from './Characters';

const blocks = getBlocks();

const BlocksList = ({ match }) => {

  return (
    <div>
      <h1>Character Blocks</h1>

      <Route path={`${match.url}/:name`}  component={BlockGrid}/>

      <Route exact path={match.url} render={() => (
        <div>
          {blocks.map(block => {
            const uname = helpers.urlName(block.blockName)
            return(
              <div key={block.blockName}>
                <Link to={{
                  pathname: match.url + '/' + uname
                }}>
                  {block.blockName}
                </Link>

              </div>
            )
          })}
        </div>
      )}/>

    </div>
  );
}

const BlockGrid = ({ match }) => {

  const urlName = match.params.name;
  const block = blocks.find(x => (helpers.urlName(x.blockName) === urlName));
  const start = block.startCode;
  const end = block.endCode;

  return(
    <div>
      <h2>{block.blockName}</h2>
      {CharactersGrid(start, end)}
    </div>
  );
}


export default BlocksList;