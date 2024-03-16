export default interface Field {
  data: {
    has_more?: boolean | undefined;
    page_token?: string | undefined;
    total?: number | undefined;
    items?: {
      fields: Record<string, string | number | number | number | boolean | {
        text?: string;
        link?: string;
      } | {
        location?: string;
        pname?: string;
        cityname?: string;
        adname?: string;
        address?: string;
        name?: string;
        full_address?: string;
      } | Array<{
        id?: string;
        name?: string;
        avatar_url?: string;
      }> | Array<string> | Array<{
        id?: string;
        name?: string;
        en_name?: string;
        email?: string;
        avatar_url?: string;
      }> | Array<{
        file_token?: string;
        name?: string;
        type?: string;
        size?: number;
        url?: string;
        tmp_url?: string;
      }>>;
      record_id?: string | undefined;
      created_by?: {
        id?: string | undefined;
        name?: string | undefined;
        en_name?: string | undefined;
        email?: string | undefined;
        avatar_url?: string | undefined;
      } | undefined;
      created_time?: number | undefined;
      last_modified_by?: {
        id?: string | undefined;
        name?: string | undefined;
        en_name?: string | undefined;
        email?: string | undefined;
        avatar_url?: string | undefined;
      } | undefined;
      last_modified_time?: number | undefined;
    }[] | undefined;
  }
}
