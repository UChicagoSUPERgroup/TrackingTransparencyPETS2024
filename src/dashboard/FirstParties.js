import React from 'react';
import { Route, Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';

import helpers from './helpers.js';

function generateEmoticonPermutations(x) {
  return [x];
}

const FirstPartyBox = (domain) => {
  return (
    <LinkContainer
      style={{ textDecoration: 'none' }}
      to={{
        pathname: '/domains/' + domain.urlName
      }}
    >
      <div key={domain.order} className="character-box">
        {domain.emoji}
      </div>
    </LinkContainer>

  );
}

const FirstPartyBoxLarge = (domain) => {
  return (
    <div key={domain.order} className="character-box-large">
        {domain.emoji}
    </div>
  );
}

const FirstPartyList = ({ match }) => (
  <div>
    <h1>Domains</h1>

    <Route path={`${match.url}/:name`}  component={FirstPartyDetails}/>
    <Route exact path={match.url} render={() => (
      <div>
        {domains.map(domain => FirstPartyBox(domain))}
      </div>
    )}/>


  </div>
);

const FirstPartyDetails = ({ match }) => {
  let details;
  let urlName = match.params.name
  details = domains.find(domain => (domain.urlName === urlName));

  if (!details) {
    return (
    <div>
      <p>FirstParty not found.</p>
    </div>
  );
  }

  let hexchars = details.hexcode.split("-");
  let decimalchars = hexchars.map(x => Number.parseInt(x, 16));
  let decimallinks = decimalchars.map(x => (
    <Link to={{pathname: '/characters/' + x}}>{x} </Link>
  ));

  return (
    <div>
      <h2>{details.customName}</h2>
      {FirstPartyBoxLarge(details)}
      <ul>
        <li><strong>Name:</strong> {details.name}</li>
        {details.annotation && <li><strong>Annotation:</strong> {details.annotation}</li>}
        {details.shortcodes && <li><strong>Shortcodes:</strong> {details.shortcodes.join(", ")}</li>}
        {details.tags && <li><strong>Tags:</strong> {details.tags.join(", ")}</li>}
        {details.emoticon && <li><strong>Emoticon:</strong> {details.emoticon}
          <ul>
            <li><em>Alternatively</em>,: {generateEmoticonPermutations(details.emoticon).join(", ")}</li>
          </ul>
        </li>}
        <li><strong>Hex: {details.hexcode}</strong></li>
        <li><strong>Decimal: {decimallinks}</strong></li>
        {details.skins && <li><strong>Skin variations:</strong> <pre>{JSON.stringify(details.skins, null, '\t')}</pre></li>}
      </ul>
      {/* <br/> */}
      {/* <pre>{JSON.stringify(details, null, '\t')}</pre> */}
    </div>
  );
}

const domains = JSON.parse(`[{"name":"GRINNING FACE","hexcode":"1F600","shortcodes":["gleeful"],"emoji":"😀","type":1,"order":1,"group":0,"subgroup":0,"version":1,"annotation":"grinning face","tags":["face","grin"]},{"name":"GRINNING FACE WITH SMILING EYES","hexcode":"1F601","shortcodes":["blissful","grin"],"emoji":"😁","type":1,"order":2,"group":0,"subgroup":0,"version":1,"emoticon":":D","annotation":"beaming face with smiling eyes","tags":["eye","face","grin","smile"]},{"name":"FACE WITH TEARS OF JOY","hexcode":"1F602","shortcodes":["joyful","haha"],"emoji":"😂","type":1,"order":3,"group":0,"subgroup":0,"version":1,"emoticon":":')","annotation":"face with tears of joy","tags":["face","joy","laugh","tear"]},{"name":"ROLLING ON THE FLOOR LAUGHING","hexcode":"1F923","shortcodes":["entertained","rofl"],"emoji":"🤣","type":1,"order":4,"group":0,"subgroup":0,"version":3,"emoticon":":'D","annotation":"rolling on the floor laughing","tags":["face","floor","laugh","rolling"]},{"name":"SMILING FACE WITH OPEN MOUTH","hexcode":"1F603","shortcodes":["glad","smile"],"emoji":"😃","type":1,"order":5,"group":0,"subgroup":0,"version":1,"annotation":"grinning face with big eyes","tags":["face","mouth","open","smile"]}]`);

domains.forEach(domain => {
  if (domain.annotation) {
    domain.urlName = helpers.urlName(domain.annotation);
    // emoji.cleanName = helpers.cleanName(emoji.annotation);
    domain.customName = domain.annotation;
  } else {
    domain.urlName = helpers.urlName(domain.name);
    // emoji.cleanName = helpers.cleanName(emoji.name);
    domain.customName = helpers.cleanName(domain.name);
  }
})


export default FirstPartyList;