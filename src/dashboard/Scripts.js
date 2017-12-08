import React from 'react';
import {
  Route,
  Link
} from 'react-router-dom';

import unicode from 'unicode-10.0.0';
// import {getBlocks, getCharacters} from 'unidata';

import helpers from './helpers';
import {CharacterBox} from './Characters'

// const unicharadata = require("unicharad/ata");
// import unicharadata from 'unicharadata';

const ScriptList = ({ match }) => {
  console.log(unicode);

  let type = "Script"
  if (match.path.includes('scripts')) {
    type = 'Script';
  } else if (match.path.includes('blocks')) {
    type = 'Block';
  }

  return (
    <div>
      <h1>Scripts</h1>

      <Route path={`${match.url}/:name`}  component={CharactersGrid}/>

      <Route exact path={match.url} render={() => (
        <div>
          {unicode[type].map(scriptName => (
            <div key={scriptName}>
              <Link to={{
                pathname: match.url + '/' + scriptName
              }}>
                {helpers.cleanScriptName(scriptName)}
              </Link>

            </div>
          ))}
        </div>
      )}/>

    </div>
  );
}

const CharactersGrid = ({ match }) => {

  const scriptName = match.params.name;
  let type = "Script"
  if (match.path.includes('scripts')) {
    type = 'Script';
  } else if (match.path.includes('blocks')) {
    type = 'Block';
  }

  // const codePoints = require('unicode-10.0.0/Script/' + scriptName + '/code-points');
  const symbols = require('unicode-10.0.0/' + type + '/' + scriptName + '/symbols');

  return(
    <div>
      <h2>{helpers.cleanScriptName(scriptName)}</h2>
      {symbols.map(symbol => CharacterBox(symbol))}
    </div>
  );

}

export default ScriptList;