import { JSXElement } from "solid-js"
import Emph from "./components/Emph";
import Warn from "./components/Warn";

export type TutorialAction = {
  type: 'read'
} | {
  type: 'playerAction'
  from: number,
  to: number,
} | {
  type: "machineAction",
  from: number, 
  to: number,  
}

const read: TutorialAction = {type: 'read'};

export type Tutorial = {
  text: JSXElement,
  action: TutorialAction,
}[];

export const tutorial: Tutorial = [
  { text: <>Bienvenue dans le <Emph>tutoriel</Emph>!</>, action: read},
  { text: <><Emph>Catch the lion</Emph> est un jeu à deux joueurs sur un plateau 4x3.
            Le but est de capturer le <Warn>lion</Warn> adverse.</>, action: read
  },
  { text: <>Chaque joueur possède 4 pièces: un <Emph>lion</Emph>, une <Emph>girafe</Emph>, un <Emph>éléphant</Emph> et un <Emph>poussin</Emph>.
            L'<Emph>orientation</Emph> d'une pièce indique à quel joueur elle appartient.</>,
    action: read
  },
  { text: <>Chaque pièce peut se déplacer d'une case dans une des directions indiquées sur la pièce
            si la case d'arrivée est vide ou si il y a une pièce adverse dessus.</>,
    action: read
  },
  {text: <>Une pièce peut <Emph>capturer</Emph> une pièce adverse en se déplaçant dessus.
           Essaie de capturer mon <Warn>poussin</Warn> avec ton <Emph>poussin</Emph> en utilisant un <Emph>Glisser-déposer</Emph>.</>,
    action: {type: 'playerAction', from: 3, to: 4}
  },
  { text: <>Bravo, le poussin adverse fait partie maintenant de ta <Emph>réserve</Emph>.
            A partir du tour suivant tu pourras le placer sur n'importe quelle case vide.</>,
    action: read
  },
  { text: <>C'est maintenant à moi de jouer</>,
    action: {type: 'machineAction', from: 4, to: 4}
  },
  { text: <>J'ai capturé ton <Emph>poussin</Emph> avec mon <Warn>éléphant</Warn>.
            Essaie maintenant déplacer le <Emph>poussin</Emph> de ta réserve vers la case indiquée.</>,
    action: {type: 'playerAction', from: 7, to: 7}
  },
  { text: <>Bravo! C'est maintenant à moi de jouer.</>,
    action: {type: 'machineAction', from: 4, to: 6}
  },
  { text: <>Je déplace à nouveau mon <Warn>éléphant</Warn>. Ton <Emph>lion</Emph> est menacé.
      Capture mon <Warn>éléphant</Warn> avec ton <Emph>lion</Emph> pour parer la menace</>,
    action: {type: 'playerAction', from: 1, to: 6}
  },
  { text: <>Bravo! Tu as paré la menace! C'est maintenant à moi de jouer.</>,
    action: {type: 'machineAction', from: 6, to: 3} 
  },
  { text: <>Je déplace ma <Warn>girafe</Warn> menaçant ton <Emph>lion</Emph>. Tu ne peux pas la capturer car ton lion se ferait capturer au coup suivant.
            Tu dois donc fuir. Déplace ton <Emph>lion</Emph> vers la case indiquée.</>,
    action: {type: 'playerAction', from: 1, to: 10}
  },
  { text: <>Bravo! C'est maintenant à moi de jouer.</>,
    action: {type: 'machineAction', from: 3, to: 6} 
  },
  { text: <>J'ai utilisé le <Emph>poussin</Emph> de ma réserve. Ton <Emph>éléphant</Emph> est bloqué, il va se faire prendre par mon <Warn>poussin</Warn>. Tu ne peux rien faire contre ça.
            Déplace ta <Emph>girafé</Emph> à la case indiquée.
          </>,
    action: {type: 'playerAction', from: 2, to: 8} 
  },
  { text: <>Bravo! C'est maintenant à moi de jouer.</>,
    action: {type: 'machineAction', from: 3, to: 9} 
  },
  { text: <>Mon <Warn>poussin</Warn> est arrivé sur la dernière rangée, il  est promu en <Warn>poule</Warn>. Cette poule est très dangereuse vu ses mouvements autorisés.
            Dépèche-toi de la capturer.
          </>,
    action: {type: 'playerAction', from: 1, to: 9} 
  },
  { text: <>Une fois une <Emph>poule</Emph> capturée, elle redevient un <Emph>poussin</Emph>. Tu ne peux pas directement promouvoir un poussin de la réserve en poule.</>,
    action: read 
  },

  { text: <>Bravo! Tu as complété le tutoriel! Tu peux commencer à jouer en cliquant sur <Emph>Nouvelle partie</Emph>.</>,
    action: read 
  },

]
