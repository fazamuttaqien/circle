// const UUIDRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{3}-[a-f0-9]{3}-[a-f0-9]{12}$/i
const isValidUUID = (uuid: string): boolean => {
  const UUIDRegex =
    /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
  return UUIDRegex.test(uuid);
};

export default isValidUUID;
