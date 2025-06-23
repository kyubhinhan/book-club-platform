declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: { address: string; extraAddress?: string }) => void;
        onresize?: () => void;
        width: string;
        height: string;
      }) => {
        embed: (element: HTMLElement | null) => void;
      };
    };
  }
}

export {};
